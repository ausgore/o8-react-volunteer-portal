export interface FieldOptions {
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
    options?: FieldOptions[];
}

export interface CustomFieldInputProps {
    customField: CustomField;
    updateCustomField: (customFieldName: string, value: any) => void;
}