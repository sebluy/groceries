import * as React from 'react'
import * as ReactDOM from 'react-dom'

export class App extends React.Component<any, any> {

    render() {
        return (
            <div>Hello World!</div>
        )
    }

}

ReactDOM.render(React.createElement(App), document.getElementById('react-root'))