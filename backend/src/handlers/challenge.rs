use actix_multipart::Multipart;
use actix_web::{post, web, HttpResponse, Responder, HttpRequest};
use crate::db::DbContext;
use crate::auth::validate_jwt;
use crate::model::UserAnswer;
use futures_util::{StreamExt, TryStreamExt};
use mongodb::bson::doc;
use std::fs;
use std::io::Write;
use chrono::Utc;
use std::collections::HashMap;

/// Extracts the spell hash from the JWT cookie.
fn get_user_from_request(req: HttpRequest) -> Option<String> {
    req.cookie("jwt")
        .and_then(|c| validate_jwt(c.value()).ok())
        .map(|claims| claims.sub)
}

/// Submits or updates the user's answers for challenges.
#[post("/submitAnswer")]
pub async fn submit_answer(
    db: web::Data<DbContext>,
    req: HttpRequest,
    answers: web::Json<HashMap<String, HashMap<String, String>>>,
) -> impl Responder {
    let spell_hash = match get_user_from_request(req) {
        Some(h) => h,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_answer = UserAnswer {
        spell_hash: spell_hash.clone(),
        challenges: answers.into_inner(),
    };

    // Upsert answers
    let options = mongodb::options::ReplaceOptions::builder().upsert(true).build();
    let res = db.answers.replace_one(
        doc! { "_id": &spell_hash },
        user_answer
    ).with_options(options).await;

    match res {
        Ok(_) => HttpResponse::Ok().json(doc! { "status": "OK" }),
        Err(_) => HttpResponse::InternalServerError().body("Failed to save answers"),
    }
}

/// Handles file uploads for challenge solutions, storing them in the `uploads` directory.
#[post("/submitSolutionFile")]
pub async fn submit_solution_file(
    req: HttpRequest,
    mut payload: Multipart,
) -> impl Responder {
    let spell_hash = match get_user_from_request(req) {
        Some(h) => h,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let upload_dir = "uploads";
    if let Err(_) = fs::create_dir_all(upload_dir) {
        return HttpResponse::InternalServerError().body("Failed to create upload directory");
    }

    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_disposition = field.content_disposition();
        let filename = content_disposition
            .and_then(|cd| cd.get_filename().map(|f| f.to_string()))
            .unwrap_or_else(|| "unnamed_file".to_string());

        let timestamp = Utc::now().timestamp();
        let safe_filename = format!("{}_{}_{}", spell_hash, timestamp, filename);
        let filepath = format!("{}/{}", upload_dir, safe_filename);

        let mut f = match fs::File::create(&filepath) {
            Ok(file) => file,
            Err(_) => return HttpResponse::InternalServerError().body("Failed to create file"),
        };

        while let Some(chunk) = field.next().await {
            let data = match chunk {
                Ok(d) => d,
                Err(_) => return HttpResponse::InternalServerError().body("Failed to read chunk"),
            };
            if let Err(_) = f.write_all(&data) {
                return HttpResponse::InternalServerError().body("Failed to write to file");
            }
        }
    }

    HttpResponse::Ok().json(doc! { "status": "OK" })
}
