export interface CustomField {
    name: string;
    label: string;
    htmlType: string;
    dataType: string;
    value: any;
    optionGroupId?: number;
    options?: {
        name: string;
        label: string;
        value: string;
    }[]
}

export interface CustomFieldInputProps {
    customField: CustomField;
    updateCustomField: (customFieldName: string, value: any) => void;
}