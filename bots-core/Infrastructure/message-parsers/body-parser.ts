export interface IParsedBody {
    id: string,
    text: string,
    photo?: string
}

export class ParseBody {
    private parsedBody: IParsedBody;

    constructor(body: any) {
        this.parsedBody = ParseBody.parse(body)
    }

    static parse(body: any) {
        return body.callback_query
            ? {
                message: {
                    chat: {
                        id: body.callback_query.from.id,
                    },
                    text: body.callback_query.data,
                }
            }
            : {...body}
    }
}
