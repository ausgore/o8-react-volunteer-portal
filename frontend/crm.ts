import axios, { AxiosResponse } from "axios";
import config from "../config";
import CryptoJS from "crypto-js";

export type ComparisonOperator = "=" | "<=" | ">=" | ">" | "<" | "LIKE" | "<>" | "!=" | "NOT LIKE" | "IN" | "NOT IN" | "BETWEEN" | "NOT BETWEEN" | "IS NOT NULL" | "IS NULL" | "CONTAINS" | "NOT CONTAINS" | "IS EMPTY" | "IS NOT EMPTY" | "REGEXP" | "NOT REGEXP" | "REGEXP BINARY" | "NOT REGEXP BINARY";
interface ParamProps {
    select?: string[];
    limit?: number;
    where?: [string, ComparisonOperator, any?][];
    order?: [string, "ASC" | "DESC"][];
    values?: [string, any][];
    offset?: number;
    join?: [string, string, [string, ComparisonOperator, any?]][];
}

export default async function CRM(entity: string, action: string, params?: ParamProps) {
    // const key = "iloveo8";
    // const iv = "8f3f2f0355c37b7d1dd81965dbd0516f";
    // const encryption = CryptoJS.AES.encrypt(JSON.stringify({ entity, action, ...params }), key, { iv: iv as any });

    const url = `${config.domain}/portal/api/traditional_api_call.php`;
    console.log(params);
    const result = await axios.post(url, {
        entity, action, ...params
    }).catch(console.log) as AxiosResponse<any, any>
    return result;
}