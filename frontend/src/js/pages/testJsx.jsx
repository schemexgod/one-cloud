import PlayWebUI from 'play-web-ui'
import { prop, View } from '../play-web-ui'

class TestCustomClass extends View {
  compile() {
    return (
      <section custom-prop={prop('firstName')} myfunc={(props) => props.firstName}>
        i did it {prop('firstName')} {prop('children')}
        <div custom-prop={prop('firstName')}>oh shit</div>
        {/* {prop('children')} */}
      </section>
    )
  }
}

class TestList extends View {
  compile() {
    return (

      <ul>{prop('children')}</ul>
    )
  }
}

export function testJSX2() {
  console.log('this', this)
  let ret
  // try {
  ret = (
    <TestList>
      <TestCustomClass firstName='mike'> <span>inline child {prop('firstName')}!</span></TestCustomClass >
    </TestList>

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
  testJSX.render({ firstName: 'dddddaaa', subobj: { lastName: 'aaaaa2' }, children: [<div>hello {prop('firstName')}</div>] })
})