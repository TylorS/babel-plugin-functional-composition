const add = x => y => x + y

const add3 = 3 >>> add

const add0 = 0 >>> add

const add0Then3 = add0 >> add3

const x = add0Then3(1)
