use crate::model::{Checkpoint, UserAnswer, UserData};
use mongodb::{Client, Collection, Database};
use std::env;

/// Holds the MongoDB collections and database instance.
pub struct DbContext {
    pub users: Collection<UserData>,
    pub answers: Collection<UserAnswer>,
    pub checkpoints: Collection<Checkpoint>,
    pub _db: Database,
}

impl DbContext {
    /// Initializes the database connection and ensures collections/indexes are set up.
    pub async fn init() -> Self {
        let uri =
            env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        let client = Client::with_uri_str(&uri)
            .await
            .expect("Failed to connect to MongoDB");
        let _db = client.database("butcuacotam");

        let users = _db.collection::<UserData>("users");
        let answers = _db.collection::<UserAnswer>("answers");
        let checkpoints = _db.collection::<Checkpoint>("checkpoints");

        let context = DbContext {
            users,
            answers,
            checkpoints,
            _db,
        };

        context.ensure_initialized().await;

        context
    }

    /// Ensures that the database and collections are properly set up.
    async fn ensure_initialized(&self) {
        // List collections to check if they already exist
        let collection_names = self._db.list_collection_names().await.unwrap_or_default();

        if !collection_names.contains(&"users".to_string()) {
            if let Err(e) = self._db.create_collection("users").await {
                log::error!("Failed to create 'users' collection: {}", e);
            } else {
                log::info!("Created 'users' collection.");
            }
        }

        if !collection_names.contains(&"answers".to_string()) {
            if let Err(e) = self._db.create_collection("answers").await {
                log::error!("Failed to create 'answers' collection: {}", e);
            } else {
                log::info!("Created 'answers' collection.");
            }
        }

        if !collection_names.contains(&"checkpoints".to_string()) {
            if let Err(e) = self._db.create_collection("checkpoints").await {
                log::error!("Failed to create 'checkpoints' collection: {}", e);
            } else {
                log::info!("Created 'checkpoints' collection.");
            }
        }

        // Ensure the uploads directory exists
        if let Err(e) = std::fs::create_dir_all("uploads") {
            log::error!("Failed to create uploads directory: {}", e);
        } else {
            log::info!("Uploads directory ensured.");
        }

        log::info!("Database initialization complete.");
    }
}
