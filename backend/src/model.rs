use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Progress {
    pub timestamp: i64,
    pub path: String,
    pub index: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserData {
    #[serde(rename = "_id")]
    pub spell_hash: String,
    pub name: String,
    pub email: String,
    pub progress: Progress,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserAnswer {
    #[serde(rename = "_id")]
    pub spell_hash: String,
    pub challenges: HashMap<String, HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Checkpoint {
    pub spell_hash: String,
    pub name: String,
    pub checkpoint_name: String,
    pub timestamp: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CheckpointRequest {
    pub checkpoint_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // spell_hash
    pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub spell_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenRequest {
    pub spell_hash: String,
}
