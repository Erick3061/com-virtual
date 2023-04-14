import React from 'react'

export const Select = (options: Array<string>) => {

    return (
        <select>
            {options.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
    )
}
