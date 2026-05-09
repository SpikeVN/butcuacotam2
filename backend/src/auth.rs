use crate::model::Claims;
use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use std::fs;
use std::path::Path;

/// Path to the JWT secret key file, resolved relative to the backend directory.
const KEY_FILE: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/jwt_secret.key");

/// Loads the JWT secret from a file or creates one if it doesn't exist.
pub fn get_jwt_secret() -> Vec<u8> {
    let path = Path::new(KEY_FILE);
    if path.exists() {
        fs::read(path).expect("Failed to read JWT secret file")
    } else {
        let secret: [u8; 32] = rand::random();
        fs::write(path, &secret).expect("Failed to write JWT secret file");
        secret.to_vec()
    }
}

/// Generates a JWT token for a given user hash (spell hash).
pub fn create_jwt(user_hash: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(7))
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: user_hash.to_owned(),
        exp: expiration as usize,
    };

    let secret = get_jwt_secret();
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(&secret),
    )
}

/// Validates a JWT token and returns the claims.
pub fn validate_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let secret = get_jwt_secret();
    let validation = Validation::default();
    let token_data = decode::<Claims>(token, &DecodingKey::from_secret(&secret), &validation)?;
    Ok(token_data.claims)
}
