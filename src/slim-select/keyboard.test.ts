import { afterEach, describe, expect, test } from 'vitest'
import SlimSelect from './index'

describe('Dropdown search keyboard interaction', () => {
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

  test('search stays inside the dropdown and receives focus after opening', () => {
    const input = create()
    expect(input.closest('.ss-content')).toBe(slim.render.content.main)
    expect(input.closest('.ss-main')).toBeNull()
    expect(input.tabIndex).toBe(-1)
    expect(slim.render.main.main.tabIndex).toBe(0)
    expect(input.hasAttribute('aria-hidden')).toBe(true)
    slim.render.main.main.focus()
    press(slim.render.main.main, 'ArrowDown')
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
    slim.render.main.main.focus()
    press(slim.render.main.main, 'ArrowDown')
    press(input, 'Escape')
    expect(document.activeElement).toBe(slim.render.main.main)
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(input.hasAttribute('aria-hidden')).toBe(true)
    press(slim.render.main.main, 'Enter')
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.hasAttribute('aria-activedescendant')).toBe(false)
    expect(slim.getSelected()).toEqual(['it'])
  })

  test('Space types normally and Enter selects the active option', () => {
    const input = create()
    slim.render.main.main.focus()
    press(slim.render.main.main, 'ArrowDown')
    expect(press(input, ' ').defaultPrevented).toBe(false)
    expect(slim.getSelected()).toEqual(['it'])
    press(input, 'Enter')
    expect(slim.getSelected().sort()).toEqual(['be', 'it'])
    expect(document.activeElement).toBe(input)
  })
})
