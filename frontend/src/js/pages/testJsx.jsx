import PlayWebUI from 'play-web-ui'

const TestCustomEl = (innProps) => {
  return (
    <>
      <main>
        <h3 custom-prop="hi">i am custom</h3>
        {innProps?.children}
      </main>
      <section>new section</section>
    </>

  )
}

export function testJSX2() {
  console.log('this', this)
  return (
    <>
      <div id="hello2" onClick={(event) => {
        /** @type {HTMLElement} */
        const el = event.target
        el.style.backgroundColor = 'red'
        console.log('event', event, event.target, event.currentTarget)
      }}>
        <span>ttddd</span>
        <div>
          <TestCustomEl custom-in-prop="fine">ddd</TestCustomEl>
        </div>

        <button className="btn btn-primary">My Button</button>

        {() => {
          // Testing loops
          const rNodes = []
          for (let i = 0; i < 10; i++) {
            rNodes.push(<div>loop {i}</div>)
          }
          return rNodes
        }}
      </div>
    </>
  )
}

export const testJSX = new testJSX2()

console.log('testJSX', testJSX)
document.body.appendChild(testJSX)