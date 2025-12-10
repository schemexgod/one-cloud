import PlayWebUI, { View } from "play-web-ui";
// import './database.css'


export class SignInPage extends View {
    /** @type {AppContext} */
    context

    /** @type {'loading' | 'complete'} */
    status = 'loading'

    /**
     * Initialize with AppContext
     * @param {AppContext} context 
     */
    constructor(context) {
        super(context)
        this.context = context ?? {}
    }

    compile() {
        return (
            <section>
                <h3>Sign In</h3>
                <ul class="list">
                    <li><a onClick={this.onGoogleClick}>Google</a></li>
                </ul>
            </section>
        )
    }

    didRender(props) {
        console.log('sign in page', this.domEl, props)

    }

    onGoogleClick() {
        console.log('clicked')
    }
}


export default SignInPage
