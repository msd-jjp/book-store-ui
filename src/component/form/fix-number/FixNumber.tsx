// import React from 'react';
import { Input } from '../input/Input';
import { Utility } from '../../../asset/script/utility';

export class FixNumber extends Input {

    handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        // console.log(Utility.fix_phrase_numbers(event.target.value));
        const fix_phrase_numbers = Utility.fix_phrase_numbers(event.target.value);
        this.setValidate(fix_phrase_numbers); // event.target.value
        this.props.onChange && this.props.onChange(fix_phrase_numbers, this.handleValidate(fix_phrase_numbers)); // event.target.value
    }

}
