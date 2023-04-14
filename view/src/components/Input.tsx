import React from 'react';
import { Control, Controller, RegisterOptions } from 'react-hook-form';

interface Props<T> extends React.InputHTMLAttributes<HTMLInputElement> {
    formInputs: T;
    control: Control<any, any>;
    rules?: RegisterOptions;
}

export const Input = <T extends Object>(props: Props<T>) => {
    const { control, name, rules } = props;

    return (
        <Controller
            control={control}
            rules={{ ...rules }}
            name={String(name)}
            render={({ field, fieldState, formState }) => (
                <input {...field} placeholder={name} />
            )
            }
        />
    )
}