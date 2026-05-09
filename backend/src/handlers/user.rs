use crate::auth::validate_jwt;
use crate::db::DbContext;
use crate::model::{Checkpoint, CheckpointRequest, Progress};
use actix_web::{HttpRequest, HttpResponse, Responder, get, post, web};
use chrono::Utc;
use mongodb::bson::doc;

/// Extracts the spell hash from the JWT cookie.
fn get_user_from_request(req: HttpRequest) -> Option<String> {
    if let Some(c) = req.cookie("jwt") {
        match validate_jwt(c.value()) {
            Ok(claims) => Some(claims.sub),
            Err(e) => {
                log::warn!("JWT validation failed: {}", e);
                None
            }
        }
    } else {
        log::info!(
            "No jwt cookie found in request headers: {:?}",
            req.headers()
        );
        None
    }
}

#[get("/profile")]
pub async fn get_profile(db: web::Data<DbContext>, req: HttpRequest) -> impl Responder {
    let spell_hash = match get_user_from_request(req) {
        Some(h) => h,
        None => return HttpResponse::Unauthorized().json(doc! { "status": "unauthorized" }),
    };

    let user = db.users.find_one(doc! { "_id": &spell_hash }).await;

    match user {
        Ok(Some(user_data)) => HttpResponse::Ok().json(user_data),
        Ok(None) => HttpResponse::Unauthorized().json(doc! { "status": "unauthorized" }),
        Err(_) => HttpResponse::InternalServerError().body("Database error"),
    }
}

#[post("/validateSession")]
pub async fn validate_session(
    db: web::Data<DbContext>,
    req: HttpRequest,
    client_progress: web::Json<Progress>,
) -> impl Responder {
    let spell_hash = match get_user_from_request(req) {
        Some(h) => h,
        None => return HttpResponse::Unauthorized().json(doc! { "status": "unauthorized" }),
    };

    let user = db.users.find_one(doc! { "_id": &spell_hash }).await;

    match user {
        Ok(Some(user_data)) => {
            if client_progress.timestamp > user_data.progress.timestamp {
                HttpResponse::Ok().json(doc! { "status": "server is outdated" })
            } else {
                HttpResponse::Ok().json(doc! { "status": "OK" })
            }
        }
        Ok(None) => HttpResponse::Unauthorized().json(doc! { "status": "unauthorized" }),
        Err(_) => HttpResponse::InternalServerError().body("Database error"),
    }
}

#[post("/saveProgress")]
pub async fn save_progress(
    db: web::Data<DbContext>,
    req: HttpRequest,
    new_progress: web::Json<Progress>,
) -> impl Responder {
    let spell_hash = match get_user_from_request(req) {
        Some(h) => h,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let update_result = db.users.update_one(
        doc! { "_id": &spell_hash },
        doc! { "$set": { "progress": mongodb::bson::to_bson(&new_progress.into_inner()).unwrap() } }
    ).await;

    match update_result {
        Ok(_) => HttpResponse::Ok().json(doc! { "status": "OK" }),
        Err(_) => HttpResponse::InternalServerError().body("Failed to update progress"),
    }
}

#[post("/checkpoint")]
pub async fn checkpoint(
    db: web::Data<DbContext>,
    req: HttpRequest,
    checkpoint_req: web::Json<CheckpointRequest>,
) -> impl Responder {
    let spell_hash = match get_user_from_request(req) {
        Some(h) => h,
        None => return HttpResponse::Unauthorized().finish(),
    };

    // Look up user to get their name
    let user = db.users.find_one(doc! { "_id": &spell_hash }).await;

    match user {
        Ok(Some(user_data)) => {
            let checkpoint_data = Checkpoint {
                spell_hash: spell_hash.clone(),
                name: user_data.name,
                checkpoint_name: checkpoint_req.checkpoint_name.clone(),
                timestamp: Utc::now().timestamp(),
            };

            if let Err(e) = db.checkpoints.insert_one(checkpoint_data).await {
                log::error!("Failed to save checkpoint: {}", e);
                return HttpResponse::InternalServerError().body("Failed to save checkpoint");
            }

            HttpResponse::Ok().json(doc! { "status": "OK" })
        }
        Ok(None) => HttpResponse::Unauthorized().finish(),
        Err(_) => HttpResponse::InternalServerError().body("Database error"),
    }
}
