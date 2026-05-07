"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentTests = getComponentTests;
function getComponentTests(schema) {
    return `
  it('should render successfully', () => {
    const { baseElement } = render(<${schema.className} />);
    expect(baseElement).toBeTruthy();
  });
  `;
}
