'use fc'

import { test } from './import'

test()

const add = x => y => x + y

const add3 = 3 >>> add

const add0 = 0 >>> add

const add0Then3 = add0 >> add3

export const x = add0Then3(1)
