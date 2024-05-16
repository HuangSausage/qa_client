import fs from 'fs'
export default defineEventHandler((event) => {
    let { file } = event.req
    fs.readFile(file.path, (err, data) => {
        if (err) return console.error(err)
        // 寫入 upload 資料夾
        fs.writeFile(`upload/${file.filename}_${file.originalname}`, data, () => {
            return res.json(`upload/${file.filename}_${file.originalname}`);
        })
    })
})