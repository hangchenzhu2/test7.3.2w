// 天气图表可视化组件
class WeatherCharts {
    constructor() {
        this.charts = {};
        this.updateChartConfig();
    }

    // 更新图表配置
    updateChartConfig() {
        // 检测当前主题
        const isLight = document.body.classList.contains('theme-light');
        const textColor = isLight ? '#333333' : '#ffffff';
        const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        
        this.chartConfig = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            }
        };
    }

    // 创建温度趋势图
    createTemperatureChart(canvasId, forecastData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        const labels = forecastData.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        const highTemps = forecastData.map(day => day.high);
        const lowTemps = forecastData.map(day => day.low);
        
        // 简单的图表绘制
        this.drawLineChart(ctx, canvas, labels, [
            { label: 'High', data: highTemps, color: '#ff6b6b' },
            { label: 'Low', data: lowTemps, color: '#4ecdc4' }
        ]);
        
        return ctx;
    }

    // 绘制简单折线图
    drawLineChart(ctx, canvas, labels, datasets) {
        const width = canvas.width;
        const height = canvas.height;
        const padding = 50;
        
        // 获取当前主题颜色
        const isLight = document.body.classList.contains('theme-light');
        const textColor = isLight ? '#333333' : '#ffffff';
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 设置样式
        ctx.strokeStyle = textColor;
        ctx.fillStyle = textColor;
        ctx.font = '12px Arial';
        ctx.lineWidth = 1; // 设置坐标轴线宽为1，保持细线
        
        // 绘制坐标轴
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // 计算数据范围
        const allData = datasets.flatMap(d => d.data);
        const minVal = Math.min(...allData) - 5;
        const maxVal = Math.max(...allData) + 5;
        
        // 绘制数据线和数据点
        datasets.forEach((dataset, datasetIndex) => {
            ctx.strokeStyle = dataset.color;
            ctx.fillStyle = dataset.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            const points = [];
            dataset.data.forEach((value, index) => {
                const x = padding + (index * (width - 2 * padding)) / (labels.length - 1);
                const y = height - padding - ((value - minVal) * (height - 2 * padding)) / (maxVal - minVal);
                points.push({ x, y, value });
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // 绘制数据点和数值
            points.forEach(point => {
                // 绘制数据点
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                ctx.fill();
                
                // 绘制数值标签
                ctx.fillStyle = textColor;
                ctx.font = '11px Arial';
                const textY = datasetIndex === 0 ? point.y - 10 : point.y + 20;
                ctx.fillText(Math.round(point.value) + '°', point.x - 8, textY);
                ctx.fillStyle = dataset.color;
            });
        });
        
        // 绘制X轴标签
        ctx.fillStyle = textColor;
        ctx.font = '12px Arial';
        labels.forEach((label, index) => {
            const x = padding + (index * (width - 2 * padding)) / (labels.length - 1);
            ctx.fillText(label, x - 15, height - 10);
        });
        
        // 绘制Y轴刻度
        ctx.fillStyle = textColor;
        ctx.font = '10px Arial';
        for (let i = 0; i <= 5; i++) {
            const value = minVal + (maxVal - minVal) * (i / 5);
            const y = height - padding - (i * (height - 2 * padding)) / 5;
            ctx.fillText(Math.round(value) + '°', 5, y + 3);
        }
        
        // 绘制图例
        ctx.font = '12px Arial';
        let legendX = width - 150;
        datasets.forEach((dataset, index) => {
            ctx.fillStyle = dataset.color;
            ctx.fillRect(legendX, 15 + index * 20, 15, 3);
            ctx.fillStyle = textColor;
            ctx.fillText(dataset.label, legendX + 20, 20 + index * 20);
        });
    }

    // 创建降水概率图
    createPrecipitationChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // 确保使用最新的主题配置
        this.updateChartConfig();

        const labels = forecastData.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const rainChance = forecastData.map(day => day.chanceOfRain || 0);
        const snowChance = forecastData.map(day => day.chanceOfSnow || 0);

        // 根据主题动态设置雪花颜色
        const isLight = document.body.classList.contains('theme-light');
        const snowColor = isLight ? '#64b5f6' : '#ffffff'; // light主题用蓝色，dark主题用白色
        const snowBgColor = isLight ? 'rgba(100, 181, 246, 0.7)' : 'rgba(255, 255, 255, 0.7)';

        // 获取当前主题颜色
        const textColor = isLight ? '#333333' : '#ffffff';
        const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Rain Chance (%)',
                    data: rainChance,
                    backgroundColor: 'rgba(74, 144, 226, 0.7)',
                    borderColor: '#4a90e2',
                    borderWidth: 1
                }, {
                    label: 'Snow Chance (%)',
                    data: snowChance,
                    backgroundColor: snowBgColor,
                    borderColor: snowColor,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        },
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Precipitation Chance (%)',
                            color: textColor
                        }
                    }
                }
            }
        });

        this.charts[canvasId] = chart;
        return chart;
    }

    // 创建风速风向图
    createWindChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const labels = forecastData.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const windSpeeds = forecastData.map(day => day.maxWind || 0);

        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Wind Speed (mph)',
                    data: windSpeeds,
                    backgroundColor: 'rgba(155, 89, 182, 0.2)',
                    borderColor: '#9b59b6',
                    borderWidth: 2,
                    pointBackgroundColor: '#9b59b6',
                    pointBorderColor: this.chartConfig.scales.y.ticks.color,
                    pointBorderWidth: 2
                }]
            },
            options: {
                ...this.chartConfig,
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: this.chartConfig.scales.x.grid.color
                        },
                        pointLabels: {
                            color: this.chartConfig.scales.y.ticks.color
                        },
                        ticks: {
                            color: this.chartConfig.scales.y.ticks.color,
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });

        this.charts[canvasId] = chart;
        return chart;
    }

    // 创建湿度图表
    createHumidityChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const labels = forecastData.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const humidity = forecastData.map(day => day.humidity || 0);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Humidity (%)',
                    data: humidity,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...this.chartConfig,
                scales: {
                    ...this.chartConfig.scales,
                    y: {
                        ...this.chartConfig.scales.y,
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Humidity (%)',
                            color: this.chartConfig.scales.y.ticks.color
                        }
                    }
                }
            }
        });

        this.charts[canvasId] = chart;
        return chart;
    }

    // 创建UV指数图表
    createUVChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const labels = forecastData.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const uvIndex = forecastData.map(day => day.uvIndex || 0);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'UV Index',
                    data: uvIndex,
                    backgroundColor: uvIndex.map(uv => this.getUVColor(uv)),
                    borderColor: '#f39c12',
                    borderWidth: 1
                }]
            },
            options: {
                ...this.chartConfig,
                scales: {
                    ...this.chartConfig.scales,
                    y: {
                        ...this.chartConfig.scales.y,
                        beginAtZero: true,
                        max: 12,
                        title: {
                            display: true,
                            text: 'UV Index',
                            color: this.chartConfig.scales.y.ticks.color
                        }
                    }
                }
            }
        });

        this.charts[canvasId] = chart;
        return chart;
    }

    // 获取UV指数对应的颜色
    getUVColor(uvIndex) {
        if (uvIndex <= 2) return 'rgba(76, 175, 80, 0.7)';    // 绿色 - 低
        if (uvIndex <= 5) return 'rgba(255, 235, 59, 0.7)';   // 黄色 - 中等
        if (uvIndex <= 7) return 'rgba(255, 152, 0, 0.7)';    // 橙色 - 高
        if (uvIndex <= 10) return 'rgba(244, 67, 54, 0.7)';   // 红色 - 很高
        return 'rgba(156, 39, 176, 0.7)';                     // 紫色 - 极高
    }

    // 创建综合天气仪表盘
    createWeatherDashboard(canvasId, currentWeather) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const data = [
            currentWeather.temperature,
            currentWeather.humidity,
            currentWeather.pressure,
            currentWeather.windSpeed,
            currentWeather.uvIndex * 10 // 放大UV指数以便显示
        ];

        const chart = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['Temperature', 'Humidity', 'Pressure', 'Wind Speed', 'UV Index'],
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 205, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                ...this.chartConfig,
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: this.chartConfig.scales.x.grid.color
                        },
                        pointLabels: {
                            color: this.chartConfig.scales.y.ticks.color
                        },
                        ticks: {
                            color: this.chartConfig.scales.y.ticks.color,
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });

        this.charts[canvasId] = chart;
        return chart;
    }

    // 更新图表数据
    updateChart(canvasId, newData) {
        const chart = this.charts[canvasId];
        if (!chart) return;

        chart.data = newData;
        chart.update();
    }

    // 销毁图表
    destroyChart(canvasId) {
        const chart = this.charts[canvasId];
        if (chart) {
            chart.destroy();
            delete this.charts[canvasId];
        }
    }

    // 销毁所有图表
    destroyAllCharts() {
        Object.keys(this.charts).forEach(canvasId => {
            this.destroyChart(canvasId);
        });
    }

    // 设置图表主题
    setTheme(theme) {
        // 更新图表配置
        this.updateChartConfig();

        // 更新所有现有图表
        Object.values(this.charts).forEach(chart => {
            const isLight = document.body.classList.contains('theme-light');
            const textColor = isLight ? '#333333' : '#ffffff';
            const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

            if (chart.options.scales) {
                if (chart.options.scales.x) {
                    chart.options.scales.x.grid.color = gridColor;
                    chart.options.scales.x.ticks.color = textColor;
                    if (chart.options.scales.x.title) {
                        chart.options.scales.x.title.color = textColor;
                    }
                }
                if (chart.options.scales.y) {
                    chart.options.scales.y.grid.color = gridColor;
                    chart.options.scales.y.ticks.color = textColor;
                    if (chart.options.scales.y.title) {
                        chart.options.scales.y.title.color = textColor;
                    }
                }
                if (chart.options.scales.r) {
                    chart.options.scales.r.grid.color = gridColor;
                    chart.options.scales.r.pointLabels.color = textColor;
                    chart.options.scales.r.ticks.color = textColor;
                }
            }
            
            // 更新图例
            if (chart.options.plugins && chart.options.plugins.legend) {
                chart.options.plugins.legend.labels = {
                    color: textColor
                };
            }
            
            // 更新雷达图中的点边框颜色
            if (chart.data && chart.data.datasets) {
                chart.data.datasets.forEach(dataset => {
                    if (dataset.pointBorderColor === '#ffffff' || dataset.pointBorderColor === '#333333') {
                        dataset.pointBorderColor = textColor;
                    }
                });
            }

            // 更新Precipitation图表中的雪花颜色
            if (chart.data && chart.data.datasets && chart.data.datasets.length > 1) {
                const snowDataset = chart.data.datasets.find(dataset => dataset.label === 'Snow Chance (%)');
                if (snowDataset) {
                    const snowColor = isLight ? '#64b5f6' : '#ffffff';
                    const snowBgColor = isLight ? 'rgba(100, 181, 246, 0.7)' : 'rgba(255, 255, 255, 0.7)';
                    snowDataset.borderColor = snowColor;
                    snowDataset.backgroundColor = snowBgColor;
                }
            }
            
            chart.update();
        });

        console.log(`📊 图表主题已更新为: ${theme}`);
    }

    // 获取所有图表实例
    getAllCharts() {
        return this.charts;
    }
}

// 创建全局图表管理实例
window.weatherCharts = new WeatherCharts(); 