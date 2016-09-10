export function test () {
  const add = x => y => x + y

  const add3 = 3 >>> add

  return add3
}
