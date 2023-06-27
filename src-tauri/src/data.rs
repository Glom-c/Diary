use crate::date::Date;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::any::Any;
use std::collections::HashMap;
use std::fmt::Display;
use std::iter::Map;

#[derive(Serialize, Deserialize)]
pub struct DayData {
    date: String,
    name: String,
    words: String,
    tasks: Vec<Value>,
}

impl DayData {
    pub fn new(date: String, name: String, words: String, tasks: Vec<Value>) -> Self {
        DayData {
            date,
            name,
            words,
            tasks,
        }
    }

    pub fn default() -> Self {
        let date = Date::today();
        let name = &date.to_string();
        DayData::new(
            date.to_string(),
            name.to_string(),
            String::from("Nothing..."),
            vec![],
        )
    }
}
