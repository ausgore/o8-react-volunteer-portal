import axios from "axios";

type ComparisonOperator = "=" | "<=" | ">=" | ">" | "<" | "LIKE" | "!=" | "IN" | "IS NOT EMPTY" | "IS EMPTY" | "IS NOT NULL" | "IS NULL";
interface ParamProps {
    select?: string[];
    limit?: number;
    where?: [string, ComparisonOperator, any?][];
    order?: [string, "ASC" | "DESC"][],
    values?: [string, any][]
}

export default async function CRM(entity: string, action: string, params?: ParamProps) {
    const url = "http://localhost/wordpress/portal/api/crm.php";
    return await axios.post(url, {
        entity, action, ...params
    });
}