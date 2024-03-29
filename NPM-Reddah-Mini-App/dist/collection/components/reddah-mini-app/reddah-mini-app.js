import { h } from "@stencil/core";
import { format } from '../../utils/utils';
export class ReddahMiniAppComponent {
    getText() {
        return format(this.first, this.middle, this.last);
    }
    render() {
        return h("div", null,
            "Hello, World! I'm ",
            this.getText());
    }
    static get is() { return "reddah-mini-app"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["reddah-mini-app.css"]
    }; }
    static get styleUrls() { return {
        "$": ["reddah-mini-app.css"]
    }; }
    static get properties() { return {
        "first": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The first name"
            },
            "attribute": "first",
            "reflect": false
        },
        "middle": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The middle name"
            },
            "attribute": "middle",
            "reflect": false
        },
        "last": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The last name"
            },
            "attribute": "last",
            "reflect": false
        }
    }; }
}
