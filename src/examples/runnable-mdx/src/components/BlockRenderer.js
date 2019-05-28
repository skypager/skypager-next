import React, { createRef, Component } from 'react'
import types from 'prop-types'
import { render } from 'react-dom'

export default class BlockRenderer extends Component {
  static contextTypes = {
    runtime: types.object,
  }

  static propTypes = {
    doc: types.object.isRequired,
    line: types.number.isRequired,
    sandbox: types.object,
  }

  state = {
    hasErrors: false,
    content: undefined,
    babelEnabled: false,
    compiled: false
  }

  renderArea = createRef()

  componentDidUpdate() {
    const { babelEnabled, compiled } = this.state

    if (babelEnabled && !compiled) {
      this.handleCompilation()
    }
  }

  async componentDidMount() {
    const { runtime } = this.context
    const { doc, line } = this.props

    try {
      if (!runtime.editor.babel) {
        await runtime.editor.enableBabel()
        this.setState({ babelEnabled: true })
      } else {
        this.setState({ babelEnabled: true })
      }
    } catch (error) {
      console.error(error)
    }
    
    this.setState({ content: this.blockContent })

    this.disposer = doc.blockContent.observe(({ name, newValue }) => {
      if (String(name) === String(line)) {
        this.setState({ content: newValue, compiled: false })
      }  
    }) 
  }
  
  componentWillUnmount() {
    this.disposer && this.disposer()
  }

  async handleCompilation() {
    const { runtime } = this.context
    const { doc } = this.props
    const { editor } = runtime
    const compiler = editor.babel.createCodeRunner(this.state.content) 

    try {
      const compiled = await compiler({ ...this.props.sandbox, $runtime: runtime, $doc: doc })
      render(compiled, this.renderArea.current)
    } catch(error) {
      this.setState({ hasErrors: true, error })
    } finally {
      this.setState({ compiled: true })
    }
  }

  get blockContent() {
    const { line, doc } = this.props
    const codeBlock = doc.codeBlocks.find(block => block.position.start.line === line)
    const blockContent = doc.blockContent.get(line)
    return blockContent || codeBlock.value
  }

  render() {
    const { style = {}, className = 'block-renderer-wrapper', id=`block-renderer-${this.props.line}` } = this.props
    return (
      <div id={id} className={className} style={style}>
        <div ref={this.renderArea} />
      </div>
    )
  }
}
