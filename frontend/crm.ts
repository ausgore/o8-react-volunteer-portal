import axios, { AxiosResponse } from "axios";
import config from "../config";

export type ComparisonOperator = "=" | "<=" | ">=" | ">" | "<" | "LIKE" | "<>" | "!=" | "NOT LIKE" | "IN" | "NOT IN" | "BETWEEN" | "NOT BETWEEN" | "IS NOT NULL" | "IS NULL" | "CONTAINS" | "NOT CONTAINS" | "IS EMPTY" | "IS NOT EMPTY" | "REGEXP" | "NOT REGEXP" | "REGEXP BINARY" | "NOT REGEXP BINARY";
interface ParamProps {
    select?: string[];
    limit?: number;
    where?: [string, ComparisonOperator, any?][];
    order?: any[],
    values?: [string, any][]
    join?: [string, string, [string, ComparisonOperator, any?]][];
}

export default async function CRM(entity: string, action: string, params?: ParamProps) {
    const url = `${config.domain}/portal/api/traditional_api_call.php`;
    const result = await axios.post(url, {
        entity, action, ...params
    }).catch(console.log) as AxiosResponse<any, any>
    return result;
}