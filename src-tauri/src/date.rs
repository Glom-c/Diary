use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::fmt;
use std::fmt::format;
use time::get_time;

/// A representation of a day in the Gregorian calendar.
#[derive(Clone, Copy, Default, PartialEq, Eq, Ord, Debug, Serialize, Deserialize)]
pub struct Date {
    /// The year.
    pub year: u32,
    /// The month.
    pub month: u8,
    /// The day.
    pub day: u8,
}

impl fmt::Display for Date {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        fmt::Debug::fmt(self, formatter)
    }
}

impl PartialOrd for Date {
    fn partial_cmp(&self, other: &Date) -> Option<Ordering> {
        macro_rules! cmp(
            ($one:expr, $two:expr) => (
                if $one > $two {
                    return Some(Ordering::Greater);
                } else if $one < $two {
                    return Some(Ordering::Less);
                }
            );
        );

        cmp!(self.year, other.year);
        cmp!(self.month, other.month);
        cmp!(self.day, other.day);

        Some(Ordering::Equal)
    }
}

impl Date {
    pub fn from(date: &str) -> Self {
        let dates = date
            .split("-")
            .map(|it| it.parse::<i32>().unwrap())
            .collect::<Vec<i32>>();
        Date::new(dates[0] as u32, dates[1] as u8, dates[2] as u8)
    }
    pub fn today() -> Date {
        Date::at_utc(time::now_utc().tm_sec as i64)
    }
    /// Create a date by the specified year, month, and day.
    #[inline]
    pub fn new(year: u32, month: u8, day: u8) -> Date {
        Date {
            year: year,
            month: month,
            day: day,
        }
    }

    /// Return the UTC date specified in seconds counting from the Unix epoch.
    pub fn at_utc(seconds: i64) -> Date {
        let time = time::at_utc(time::Timespec {
            sec: seconds,
            nsec: 0,
        });
        Date::new(
            time.tm_year as u32 + 1900,
            time.tm_mon as u8 + 1,
            time.tm_mday as u8,
        )
    }

    /// Return the UTC date specified in seconds counting from January 1, 1904.
    #[inline]
    pub fn at_utc_1904(seconds: i64) -> Date {
        Date::at_utc(seconds - 2082844800)
    }

    pub fn to_string(&self) -> String {
        format!("{}-{}-{}", self.year, self.month, self.day).to_string()
    }
}
