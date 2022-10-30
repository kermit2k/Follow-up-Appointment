import { LightningElement, api } from 'lwc';

export default class CustomToast extends LightningElement {

    @api _variant;
    @api _title;
    @api _message;

    @api get variant() {
        return _variant;
    }

    set variant(value) {
        if(value) {
            this._variant = value;
        }
    }

    @api get title() {
        return _title;
    }

    set title(value) {
        if(value) {
            this._title = value;
        }
    }

    @api get message() {
        return _message;
    }

    set message(value) {
        if(value) {
            this._message = value;
        }
    }
}