import PlayWebUI, { View } from "play-web-ui";
// import './database.css'


export class DatbaseEditPage extends View {
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
                <h3>Edit Database</h3>
                <div>
                    params: {'{'}
                    <br />
                    &nbsp; &nbsp; &nbsp; {() => `${Object.entries(this.context.route.params).map(([key, value]) => `${key} : ${value}`)}`}
                    <br />
                    {'}'}
                    <br />
                    query: {'{'}
                    <br />
                    &nbsp; &nbsp; &nbsp; {() => `${Object.entries(this.context.route.query).map(([key, value]) => `${key} : ${value}`)}`}
                    <br />
                    {'}'}
                </div>

            </section>
        )
    }

    didRender(props) {


    }

    onGoogleClick() {
        console.log('clicked')
    }
}


export default DatbaseEditPage
