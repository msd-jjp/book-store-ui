import React from "react";
import { Localization } from "../../../../config/localization/localization";

class LayoutAccountHeaderComponent extends React.Component<any>{
    render() {
        return (
            <>
                <header className="header">
                    <div className="title">{Localization.app_logo}</div>
                </header>
            </>
        )
    }
}

export const LayoutAccountHeader = LayoutAccountHeaderComponent;
