import PlayWebUI from 'play-web-ui'
import { prop, View } from '../play-web-ui'

class TestCustomClass extends View {
  compile() {
    return (
      <section>i did it {prop('firstName')} {prop('children')}  </section>
    )
  }
}

export function testJSX2() {
  console.log('this', this)
  let ret
  // try {
  ret = (
    <TestCustomClass firstName='bob'><span>inline child {prop('firstName')}!</span></TestCustomClass>

    // <button className="btn btn-primary" what="testing name">My Button {prop('firstName')}</button>

    // <>
    //   <div id="hello2" onClick={(event) => {
    //     /** @type {HTMLElement} */
    //     const el = event.target
    //     el.style.backgroundColor = 'red'
    //     console.log('event', event, event.target, event.currentTarget)
    //   }}>
    //     <span>ttddd</span>
    //     <div>
    //       <TestCustomEl custom-in-prop="fine" name="eric eng">dhereee{prop('name')}</TestCustomEl>
    //     </div>

    //     <button className="btn btn-primary" name="testing name">My Button<span>{prop('name')}</span></button>

    //     {() => {
    //       // Testing loops
    //       const rNodes = []
    //       for (let i = 0; i < 10; i++) {
    //         rNodes.push(<div>loop {i}</div>)
    //       }
    //       return rNodes
    //     }}
    //   </div>
    // </>
  )
  // } catch(err) {

  // }
  return ret
}

export const testJSX = new testJSX2()

console.log('testJSX', testJSX)
document.body.appendChild(testJSX.domEl)
console.log('BREAKING_--')
testJSX.render({ firstName: 'eric', subobj: { lastName: 'eng' } })
testJSX.domEl.addEventListener('click', () => {
  testJSX.render({ firstName: 'dddddaaa', subobj: { lastName: 'aaaaa' } })
})