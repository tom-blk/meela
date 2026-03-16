use std::env;

use log::info;
use poem::{
    EndpointExt, Route, Server,
    endpoint::{StaticFileEndpoint, StaticFilesEndpoint},
    error::ResponseError,
    get, handler,
    http::StatusCode,
    listener::TcpListener,
    web::{Data, Json, Path},
};
use serde::Serialize;
use sqlx::PgPool;

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
    #[error("Query failed")]
    QueryFailed,
}

impl ResponseError for Error {
    fn status(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
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

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv::dotenv()?;
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    info!("Initialize db pool");
    let pool = init_pool().await?;
    let app = Route::new()
        .at("/api/hello/:name", get(hello))
        .at("/favicon.ico", StaticFileEndpoint::new("www/favicon.ico"))
        .nest("/static/", StaticFilesEndpoint::new("www"))
        .at("*", StaticFileEndpoint::new("www/index.html"))
        .data(pool);
    Server::new(TcpListener::bind("0.0.0.0:3005"))
        .run(app)
        .await?;

    Ok(())
}
