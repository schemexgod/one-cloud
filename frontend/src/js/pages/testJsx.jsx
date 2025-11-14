import PlayWebUI from 'play-web-ui'
console.log('PlayWebUI', PlayWebUI)
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
  <div>1</div>
  <div>2</div>
  </>
  // <div id="hello2">
  //   <span>ttddd</span>
  //   <div>
  //     <TestCustomEl custom-in-prop="fine">ddd</TestCustomEl>
  //   </div>
  // </div>
)

console.log('testJSX', testJSX)
document.body.appendChild(testJSX)