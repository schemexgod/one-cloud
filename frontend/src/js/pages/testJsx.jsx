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

export const testJSX = (
  <>
    <div id="hello2">
      <span>ttddd</span>
      <div>
        <TestCustomEl custom-in-prop="fine">ddd</TestCustomEl>
      </div>

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

console.log('testJSX', testJSX)
document.body.appendChild(testJSX)