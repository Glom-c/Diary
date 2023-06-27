// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::data::DayData;
use crate::date::Date;
use serde::{Deserialize, Serialize};
use serde_json::{Deserializer, Serializer, Value};
use std::fs;
use tauri::api::ipc::serialize_js;

mod data;
mod date;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn save(date: &str, json: &str) {
    let date = Date::from(date).to_string();
    println!("{json}");
    let data: DayData = serde_json::from_str(json).unwrap();
    fs::create_dir("data");
    fs::write(
        &format!("data/{date}.json").to_string(),
        serialize_js(&data).unwrap(),
    )
    .unwrap();
}
#[tauri::command]
fn load(date: &str) -> String {
    let date = Date::from(date).to_string();
    println!("{date}");
    println!(
        "{}",
        fs::read_to_string(&format!("data/{date}.json").to_string()).unwrap_or("Err!".to_string())
    );
    fs::read_to_string(&format!("data/{date}.json").to_string()).unwrap_or_else(|err| {
        println!("{err}");
        "{}".to_string()
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save, load])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
