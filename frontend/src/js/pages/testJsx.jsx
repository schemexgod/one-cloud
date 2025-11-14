import { jsxToDomNode } from 'play-web-ui'

const TestCustomEl = (innProps) => {
  return (
    <main>
      <h3 custom-prop="hi">i am custom</h3>
      {innProps?.children}
    </main>

  )
}

export const testJSX = (
  <div id="hello2">
    <span>ttddd</span>
    <div>
      <TestCustomEl custom-in-prop="fine">ddd</TestCustomEl>
    </div>
  </div>
)

document.body.appendChild(testJSX)