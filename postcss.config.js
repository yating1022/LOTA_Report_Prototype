// PostCSS 配置，让它识别 Tailwind 和 autoprefixer
module.exports = {
    plugins: {
        tailwindcss: {}, // 启用 tailwindcss
        autoprefixer: {}, // 自动添加浏览器前缀（比如 -webkit-）
    },
};