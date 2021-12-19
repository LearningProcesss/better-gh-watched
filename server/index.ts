import blitz from "blitz/custom-server"
import { createServer, Server as HttpServer } from "http"
import { parse } from "url"
import { log } from "next/dist/server/lib/logging"
import { ioModule } from "./socket"
import db from 'db'

const { PORT = "3000" } = process.env
const dev = process.env.NODE_ENV !== "production"
const app = blitz({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {

    const httpServer: HttpServer = createServer((req, res) => {

        const parsedUrl = parse(req.url!, true)

        const { pathname } = parsedUrl

        handle(req, res, parsedUrl)

    }).listen(PORT, () => {
        log.success(`Ready on http://localhost:${PORT}`)
    })

    ioModule(httpServer, db)
})