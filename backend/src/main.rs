use std::env;

use log::info;
use poem::{
    EndpointExt, Route, Server,
    endpoint::{StaticFileEndpoint, StaticFilesEndpoint},
    error::ResponseError,
    get, handler, post,
    http::StatusCode,
    listener::TcpListener,
    web::{Data, Json, Path},
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
    #[error(transparent)]
    Var(#[from] std::env::VarError),
    #[error(transparent)]
    Dotenv(#[from] dotenv::Error),
    #[error("Not found")]
    NotFound,
}

impl ResponseError for Error {
    fn status(&self) -> StatusCode {
        match self {
            Error::NotFound => StatusCode::NOT_FOUND,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

async fn init_pool() -> Result<PgPool, Error> {
    let pool = PgPool::connect(&env::var("DATABASE_URL")?).await?;
    Ok(pool)
}

#[derive(Serialize)]
struct HelloResponse {
    hello: String,
}

#[handler]
async fn hello(
    Data(pool): Data<&PgPool>,
    Path(name): Path<String>,
) -> Result<Json<HelloResponse>, Error> {
    let r: (String,) = sqlx::query_as("SELECT concat('Hello ', $1)")
        .bind(&name)
        .fetch_one(pool)
        .await?;

    Ok(Json(HelloResponse { hello: r.0 }))
}

#[derive(Serialize)]
struct Submission {
    id: Uuid,
    answers: serde_json::Value,
}

#[derive(Deserialize)]
struct UpdateAnswers {
    answers: serde_json::Value,
}

#[handler]
async fn create_submission(Data(pool): Data<&PgPool>) -> Result<Json<Submission>, Error> {
    let row: (Uuid, serde_json::Value) =
        sqlx::query_as("INSERT INTO submissions DEFAULT VALUES RETURNING id, answers")
            .fetch_one(pool)
            .await?;

    Ok(Json(Submission {
        id: row.0,
        answers: row.1,
    }))
}

#[handler]
async fn get_submission(
    Data(pool): Data<&PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Submission>, Error> {
    let row: Option<(Uuid, serde_json::Value)> =
        sqlx::query_as("SELECT id, answers FROM submissions WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await?;

    match row {
        Some((id, answers)) => Ok(Json(Submission { id, answers })),
        None => Err(Error::NotFound),
    }
}

#[handler]
async fn update_submission(
    Data(pool): Data<&PgPool>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateAnswers>,
) -> Result<Json<Submission>, Error> {
    let row: Option<(Uuid, serde_json::Value)> = sqlx::query_as(
        "UPDATE submissions SET answers = $2, updated_at = NOW() WHERE id = $1 RETURNING id, answers",
    )
    .bind(id)
    .bind(&body.answers)
    .fetch_optional(pool)
    .await?;

    match row {
        Some((id, answers)) => Ok(Json(Submission { id, answers })),
        None => Err(Error::NotFound),
    }
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv::dotenv()?;
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    info!("Initialize db pool");
    let pool = init_pool().await?;
    let app = Route::new()
        .at("/api/hello/:name", get(hello))
        .at("/api/submissions", post(create_submission))
        .at(
            "/api/submissions/:id",
            get(get_submission).patch(update_submission),
        )
        .at("/favicon.ico", StaticFileEndpoint::new("www/favicon.ico"))
        .nest("/static/", StaticFilesEndpoint::new("www"))
        .at("*", StaticFileEndpoint::new("www/index.html"))
        .data(pool);
    Server::new(TcpListener::bind("0.0.0.0:3005"))
        .run(app)
        .await?;

    Ok(())
}
