mod auth;
mod db;
mod handlers;
mod model;

use crate::db::DbContext;
use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger, web};
use dotenv::dotenv;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // Ensure JWT secret is generated/loaded on startup
    crate::auth::get_jwt_secret();

    let db_context = DbContext::init().await;
    let db_data = web::Data::new(db_context);

    println!("Server starting on http://localhost:6942");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_method()
            .allow_any_header()
            .supports_credentials()
            .allowed_origin_fn(|_origin, _req_head| {
                true // Allow all origins but reflect the requested one
            })
            .max_age(3600);

        App::new()
            .app_data(db_data.clone())
            .wrap(cors)
            .wrap(Logger::default())
            .service(
                web::scope("/auth")
                    .service(handlers::auth::register)
                    .service(handlers::auth::get_token)
                    .service(handlers::auth::refresh_token),
            )
            .service(
                web::scope("/user")
                    .service(handlers::user::get_profile)
                    .service(handlers::user::validate_session)
                    .service(handlers::user::save_progress)
                    .service(handlers::user::checkpoint),
            )
            .service(handlers::challenge::submit_answer)
            .service(handlers::challenge::submit_solution_file)
    })
    .bind(("127.0.0.1", 6942))?
    .run()
    .await
}
