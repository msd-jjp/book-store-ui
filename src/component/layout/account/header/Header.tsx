import React from "react";

class LayoutAccountHeaderComponent extends React.Component<any>{
    render() {
        return (
            <>
                <header className="header">
                    <div className="title">Bookstore</div>
                </header>
            </>
        )
    }
}

export const LayoutAccountHeader = LayoutAccountHeaderComponent;

// export { LayoutAccountHeader };