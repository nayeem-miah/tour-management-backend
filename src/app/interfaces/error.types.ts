export interface TErrorSource {
    path: string;
    message: string
}

export interface TGenicErrorResponse {
    statusCode: number,
    message: string,
    errorSources?: TErrorSource[]
}