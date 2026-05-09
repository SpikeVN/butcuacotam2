use crate::auth::create_jwt;
use crate::db::DbContext;
use crate::model::{Progress, RegisterRequest, TokenRequest, UserData};
use actix_web::{HttpResponse, Responder, cookie::Cookie, cookie::SameSite, post, web};
use chrono::Utc;
use mongodb::bson::doc;

#[post("/register")]
pub async fn register(db: web::Data<DbContext>, req: web::Json<RegisterRequest>) -> impl Responder {
    let spell_hash = req.spell_hash.clone();

    // Check if user already exists
    let existing = db.users.find_one(doc! { "_id": &spell_hash }).await;
    if let Ok(Some(_)) = existing {
        return HttpResponse::Conflict().body("User already exists");
    }

    let progress = Progress {
        timestamp: Utc::now().timestamp(),
        path: "intro_game1".to_string(),
        index: 0,
    };

    let user_data = UserData {
        spell_hash: spell_hash.clone(),
        name: req.name.clone(),
        email: req.email.clone(),
        progress: progress.clone(),
    };

    if let Err(_) = db.users.insert_one(user_data.clone()).await {
        return HttpResponse::InternalServerError().body("Failed to register user");
    }

    // Initialize an empty answers document for the new user
    let initial_answers = crate::model::UserAnswer {
        spell_hash: spell_hash.clone(),
        challenges: std::collections::HashMap::new(),
    };
    let _ = db.answers.insert_one(initial_answers).await;

    match create_jwt(&spell_hash) {
        Ok(token) => {
            let cookie = Cookie::build("jwt", token)
                .path("/")
                .http_only(true)
                .same_site(SameSite::None)
                .secure(true)
                .finish();

            HttpResponse::Ok().cookie(cookie).json(user_data)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to create token"),
    }
}

#[post("/token")]
pub async fn get_token(db: web::Data<DbContext>, req: web::Json<TokenRequest>) -> impl Responder {
    let spell_hash = req.spell_hash.clone();

    let user = db.users.find_one(doc! { "_id": &spell_hash }).await;

    match user {
        Ok(Some(_)) => match create_jwt(&spell_hash) {
            Ok(token) => {
                let cookie = Cookie::build("jwt", token)
                    .path("/")
                    .http_only(true)
                    .same_site(SameSite::None)
                    .secure(true)
                    .finish();

                HttpResponse::Ok()
                    .cookie(cookie)
                    .json(doc! { "status": "OK" })
            }
            Err(_) => HttpResponse::InternalServerError().body("Failed to create token"),
        },
        Ok(None) => HttpResponse::Unauthorized().body("Invalid spell"),
        Err(_) => HttpResponse::InternalServerError().body("Database error"),
    }
}

#[post("/refresh")]
pub async fn refresh_token(// In a real app, you'd check the current token here.
    // For simplicity, we just assume they want a new one if they have a valid session.
    // This could be improved with a refresh token in DB.
) -> impl Responder {
    // Logic for refreshing could go here
    HttpResponse::Ok().body("Refresh not fully implemented but route exists")
}
