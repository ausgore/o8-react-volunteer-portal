export interface CustomFieldOptions {
    name?: string;
    label: string;
    value: any;
}

export interface CustomField {
    name: string;
    label: string;
    htmlType: string;
    dataType: string;
    value: any;
    optionGroupId?: number;
    options?: CustomFieldOptions[];
}

export interface CustomFieldInputProps {
    customField: CustomField;
    updateCustomField: (customFieldName: string, value: any) => void;
}