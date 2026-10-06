import { afterEach, describe, expect, test } from 'vitest'
import SlimSelect from './index'

describe('Persistent editable combobox', () => {
  let slim: SlimSelect

  afterEach(() => {
    slim?.destroy()
    document.body.innerHTML = ''
  })

  const create = () => {
    document.body.innerHTML = `
      <label for="destinations">Destinations</label>
      <select id="destinations" multiple>
        <optgroup label="Group 1" data-selectall="true">
          <option value="be">Belgium</option>
          <option value="cz">Czechia</option>
        </optgroup>
        <option value="it" selected>Italy</option>
      </select>`
    slim = new SlimSelect({
      select: '#destinations',
      settings: { contentPosition: 'relative', closeOnSelect: false }
    })
    return slim.render.content.search.input
  }

  const press = (target: HTMLElement, key: string) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true
    })
    target.dispatchEvent(event)
    return event
  }

  test('one visible input is the Tab entry point and keeps focus during navigation', () => {
    const input = create()
    expect(document.querySelectorAll('[role="combobox"]')).toHaveLength(1)
    expect(input.closest('.ss-main')).toBe(slim.render.main.main)
    expect(input.tabIndex).toBe(0)
    expect(slim.render.main.main.tabIndex).toBe(-1)
    expect(input.hasAttribute('aria-hidden')).toBe(false)
    input.focus()
    press(input, 'ArrowDown')
    expect(document.activeElement).toBe(input)
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(
      document.getElementById(input.getAttribute('aria-activedescendant')!)
        ?.textContent
    ).toBe('Belgium')
    press(input, 'Tab')
    expect(document.activeElement).toBe(document.querySelector('.ss-selectall'))
  })

  test('Enter reopens after Escape without selecting a stale option', () => {
    const input = create()
    input.focus()
    press(input, 'ArrowDown')
    press(input, 'Escape')
    expect(document.activeElement).toBe(input)
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(input.hasAttribute('aria-hidden')).toBe(false)
    press(input, 'Enter')
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.hasAttribute('aria-activedescendant')).toBe(false)
    expect(slim.getSelected()).toEqual(['it'])
  })

  test('Space types normally and Enter selects the active option', () => {
    const input = create()
    input.focus()
    press(input, 'ArrowDown')
    expect(press(input, ' ').defaultPrevented).toBe(false)
    expect(slim.getSelected()).toEqual(['it'])
    press(input, 'Enter')
    expect(slim.getSelected().sort()).toEqual(['be', 'it'])
    expect(document.activeElement).toBe(input)
  })
})
