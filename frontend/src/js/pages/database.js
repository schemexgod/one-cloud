import { view, View } from "../PlayUIFramework/View";


export class DatabasePage extends View {
  constructor() {
    super()
  }
  render(props) {
    super.render(props)
  }

  compileTemplate() {
    super.compileTemplate`
      <style>
        body,
        html {
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
          user-select: none;
        }

        .list {
          display: flex;
          flex-direction: column;
          padding: 5px;
          list-style-type: none;
          margin: 0;
        }

        .list .row {
          display: flex;
          flex-direction: row;
          padding: 5px 15px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        }

        .list .row>* {
          flex-grow: 1;
        }
      </style>

      <section id="db-section">
        <h1>Databases</h1>
        <div>${'title'} ${view`<span class="row">inline view</span>`}</div>
        ${view`BEFORE IT`}

        <ul class="list">
      ${(props) => {
        let nodes = []
        for (let i = 0; i < 5; i++) {
          const newV = view`<li class="row">Database ${'num'} here</li>`.render({num: i})
          nodes.push(newV)
        }
        return nodes
      }}
        </ul>
      </section>
`
    this.render()
  }
}