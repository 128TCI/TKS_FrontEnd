
export interface ImportWorkshiftRestdayDto {
    message: string;
    rowNumber: number
    columnNumber: number
    empCode: string
    employeeName: string;
    dateFrom: Date | string | null
    dateTo: Date | string | null
    workshiftCode: string
    restDay: string;
}

export interface ImportWorkshiftRestdayFormDto {
    dateFrom: "",
    dateTo: "",
    isDeleteExistingRecord: false,
    imports: ImportWorkshiftRestdayDto[]
}