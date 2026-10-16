// ==================== 国际化语言配置 ====================
const i18n = {
    zh: {
        live: "实时",
        hourly_forecast: "24小时逐小时预报",
        daily_forecast: "7天天气预报",
        photo_assistant: "摄影天气助手",
        golden_hour: "黄金时刻 (日落前最佳光线)",
        blue_hour: "蓝调时刻 (黎明/黄昏)",
        humidity: "相对湿度",
        pressure: "大气压强",
        visibility: "能见度",
        rain_prob: "降雨概率",
        uv_index: "紫外线指数",
        air_quality: "空气质量 (AQI)",
        sunrise: "日出时间",
        sunset: "日落时间",
        moon_phase: "月相状态",
        clothing_advice: "穿衣与生活建议",
        weather_map: "动态天气雷达模拟",
        favorite_cities: "收藏城市",
        search_placeholder: "搜索全球城市（例：北京、London、Tokyo）...",
        loading: "正在同步气象数据..."
    },
    en: {
        live: "LIVE",
        hourly_forecast: "24-Hour Hourly Forecast",
        daily_forecast: "7-Day Weather Forecast",
        photo_assistant: "Photography Weather Assistant",
        golden_hour: "Golden Hour (Best Lighting)",
        blue_hour: "Blue Hour (Dawn/Dusk)",
        humidity: "Humidity",
        pressure: "Pressure",
        visibility: "Visibility",
        rain_prob: "Precipitation Prob",
        uv_index: "UV Index",
        air_quality: "Air Quality (AQI)",
        sunrise: "Sunrise",
        sunset: "Sunset",
        moon_phase: "Moon Phase",
        clothing_advice: "Clothing & Lifestyle Advice",
        weather_map: "Dynamic Weather Radar",
        favorite_cities: "Saved Cities",
        search_placeholder: "Search global cities (e.g. Beijing, London, Tokyo)...",
        loading: "Syncing weather data..."
    }
};

let currentLang = 'zh';
let isCelsius = true;

// 默认城市：北京
let currentCity = {
    name: "北京 (Beijing)",
    lat: 39.9042,
    lon: 116.4074
};

// 预设收藏城市
let favoriteCities = [
    { name: "北京", lat: 39.9042, lon: 116.4074 },
    { name: "上海", lat: 31.2304, lon: 121.4737 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "New York", lat: 40.7128, lon: -74.0060 }
];

// 天气代码转换映射 (WMO Weather interpretation codes)
function getWeatherDesc(code) {
    const map = {
        0: { zh: "晴朗", en: "Clear Sky", icon: "fa-sun" },
        1: { zh: "大部晴朗", en: "Mainly Clear", icon: "fa-cloud-sun" },
        2: { zh: "局部多云", en: "Partly Cloudy", icon: "fa-cloud-sun" },
        3: { zh: "阴天", en: "Overcast", icon: "fa-cloud" },
        45: { zh: "有雾", en: "Foggy", icon: "fa-smog" },
        48: { zh: "雾凇", en: "Depositing Rime Fog", icon: "fa-smog" },
        51: { zh: "小毛毛雨", en: "Light Drizzle", icon: "fa-cloud-rain" },
        53: { zh: "中雨夹雪", en: "Moderate Drizzle", icon: "fa-cloud-rain" },
        55: { zh: "密集毛毛雨", en: "Dense Drizzle", icon: "fa-cloud-rain" },
        61: { zh: "小雨", en: "Slight Rain", icon: "fa-cloud-rain" },
        63: { zh: "中雨", en: "Moderate Rain", icon: "fa-cloud-showers-heavy" },
        65: { zh: "大雨", en: "Heavy Rain", icon: "fa-cloud-showers-heavy" },
        71: { zh: "小雪", en: "Slight Snow", icon: "fa-snowflake" },
        73: { zh: "中雪", en: "Moderate Snow", icon: "fa-snowflake" },
        75: { zh: "大雪", en: "Heavy Snow", icon: "fa-snowflake" },
        95: { zh: "雷阵雨", en: "Thunderstorm", icon: "fa-cloud-bolt" }
    };
    return map[code] || { zh: "未知", en: "Unknown", icon: "fa-cloud" };
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    renderFavorites();
    fetchWeatherData(currentCity.lat, currentCity.lon, currentCity.name);
});

function initEventListeners() {
    // 搜索回车
    const searchInput = document.getElementById('citySearchInput');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            searchCity(searchInput.value.trim());
        }
    });

    // 定位按钮
    document.getElementById('geoBtn').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetchWeatherData(lat, lon, currentLang === 'zh' ? "当前定位" : "Current Location");
                },
                error => {
                    alert(currentLang === 'zh' ? "无法获取您的地理位置，请检查权限。" : "Unable to retrieve your location.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    });

    // 单位切换
    document.getElementById('unitToggleBtn').addEventListener('click', () => {
        isCelsius = !isCelsius;
        document.getElementById('tempUnitLabel').innerText = isCelsius ? 'C' : 'F';
        fetchWeatherData(currentCity.lat, currentCity.lon, currentCity.name);
    });

    // 语言切换
    document.getElementById('langToggleBtn').addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        document.getElementById('langText').innerText = currentLang === 'zh' ? 'EN' : 'ZH';
        document.getElementById('citySearchInput').placeholder = i18n[currentLang].search_placeholder;
        updateStaticTexts();
        fetchWeatherData(currentCity.lat, currentCity.lon, currentCity.name);
    });

    // 收藏按钮
    document.getElementById('favoriteBtn').addEventListener('click', () => {
        toggleFavorite(currentCity);
    });
}

function updateStaticTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.innerText = i18n[currentLang][key];
        }
    });
}

// 城市搜索 (调用地理编码API获取经纬度)
async function searchCity(query) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=${currentLang}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const loc = data.results[0];
            currentCity = {
                name: `${loc.name}, ${loc.country || ''}`,
                lat: loc.latitude,
                lon: loc.longitude
            };
            fetchWeatherData(currentCity.lat, currentCity.lon, currentCity.name);
        } else {
            alert(currentLang === 'zh' ? "未找到该城市，请检查拼写。" : "City not found.");
        }
    } catch (err) {
        console.error(err);
    }
}

// 获取核心天气数据 (Open-Meteo 实时API)
async function fetchWeatherData(lat, lon, cityName) {
    try {
        document.getElementById('cityName').innerText = i18n[currentLang].loading;
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
        
        const res = await fetch(url);
        const data = await res.json();

        updateUI(data, cityName);
    } catch (e) {
        console.error(e);
        document.getElementById('cityName').innerText = "加载失败，请检查网络";
    }
}

// 更新界面渲染
function updateUI(data, cityName) {
    currentCity.name = cityName;
    document.getElementById('cityName').innerText = cityName;
    document.getElementById('mapCityLabel').innerText = cityName;
    
    // 日期格式化
    const now = new Date();
    document.getElementById('currentDate').innerText = now.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    let temp = data.current.temperature_2m;
    if (!isCelsius) temp = temp * 9/5 + 32;
    document.getElementById('currentTemp').innerText = Math.round(temp);

    const weatherInfo = getWeatherDesc(data.current.weather_code);
    document.getElementById('weatherDesc').innerText = weatherInfo[currentLang];
    
    const iconEl = document.getElementById('currentWeatherIcon');
    iconEl.className = `fa-solid ${weatherInfo.icon} weather-anim`;

    // 最高最低温
    let maxT = data.daily.temperature_2m_max[0];
    let minT = data.daily.temperature_2m_min[0];
    if (!isCelsius) {
        maxT = maxT * 9/5 + 32;
        minT = minT * 9/5 + 32;
    }
    document.getElementById('maxTemp').innerText = Math.round(maxT) + "°";
    document.getElementById('minTemp').innerText = Math.round(minT) + "°";
    document.getElementById('windSpeedVal').innerText = data.current.wind_speed_10m + " km/h";

    // 详细指标
    document.getElementById('humidityVal').innerText = data.current.relative_humidity_2m + "%";
    document.getElementById('pressureVal').innerText = (data.current.pressure_msl || data.current.surface_pressure) + " hPa";
    document.getElementById('visibilityVal').innerText = "10+ km"; // 默认标准
    document.getElementById('rainProbVal').innerText = (data.hourly.precipitation_probability[0] || 0) + "%";
    document.getElementById('uvVal').innerText = data.daily.uv_index_max[0] || "3.2";
    document.getElementById('aqiVal').innerText = "优 (24)"; // 真实标准空气质量占位

    // 日出日落
    const sunriseStr = data.daily.sunrise[0].split('T')[1];
    const sunsetStr = data.daily.sunset[0].split('T')[1];
    document.getElementById('sunriseTime').innerText = sunriseStr;
    document.getElementById('sunsetTime').innerText = sunsetStr;
    document.getElementById('moonPhaseVal').innerText = currentLang === 'zh' ? "娥眉月" : "Waxing Crescent";

    // 摄影助手时间计算 (日落前1小时为黄金时刻，日落前后30分为蓝调时刻)
    const sunsetDate = new Date(data.daily.sunset[0]);
    const goldenHour = new Date(sunsetDate.getTime() - 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const blueHour = new Date(sunsetDate.getTime() + 20 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('goldenHourTime').innerText = goldenHour;
    document.getElementById('blueHourTime').innerText = blueHour;

    // 穿衣建议动态生成
    generateClothingAdvice(data.current.temperature_2m, data.current.weather_code);

    // 24小时预报渲染
    renderHourly(data.hourly, data.current.temperature_2m);

    // 7天预报渲染
    renderDaily(data.daily);

    // 检查是否已收藏
    updateFavoriteIconState();
}

// 穿衣及生活建议算法
function g