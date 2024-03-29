class FruitSlotMachine {
  /**
   * @param itemsSelector 水果机格子的选择器
   * @param itemActiveClass 光标样式的class
   * @param config
   */
  constructor(itemsSelector, itemActiveClass, config = { highestDelay: 200, lowestDelay: 60, lowestDelayLoops: 3 }) {
    this.items = document.querySelectorAll(itemsSelector)
    if (this.items.length < 0) throw new Error('Selector selects no item')
    this.itemActiveClass = itemActiveClass
    this.config = config
    this.timeoutId = null
    this.reset()
  }

  reset() {
    this.timeoutId && clearTimeout(this.timeoutId) // 停止水果机转动
    this.highestDelay = this.config.highestDelay // 最高延迟（最低速度）
    this.lowestDelay = this.config.lowestDelay // 最低延迟（最高速度）
    this.lowestDelayLoops = this.config.lowestDelayLoops // 最低延迟（最高速度）持续的圈数
    this.lowestDelayTimes = this.items.length * this.lowestDelayLoops + 1 // 换算成对应的次数 + 1
    this.delay = this.highestDelay // 水果机转动到下一个奖品的时间
    this.accumulator = this.delay // 延迟时间的累加器
    this.stopPosition = -1 // 停止的位置
    this.isMoving = false // 水果机是否在转动的标识，用于防止多次启动水果机

    this.queue && this.items[this.queue[0]].classList.remove(this.itemActiveClass) // 去除奖品格子的active class

    this.queue = (function(len) { // 索引列表，用于处理切换的序号队列
      var arr = []
      for (var i = 0; i < len; ++i) arr[i] = i
      return arr
    }(this.items.length))
  }

  start() {
    if (this.isMoving) return
    this.isMoving = true
    this.move()
  }

  stop(index, callback) { // 转动结果出来后调用该方法，可设置一个回调函数，会在水果机停止后调用
    if (typeof index === 'undefined') return
    this.stopPosition = index
    this.stoppedCallback = callback
  }

  move(isFirstMove = true) {
    !isFirstMove && this.queue.push(this.queue.shift()) // 循环队列移动一次
    this.reRender()

    if (this.stopPosition === this.queue[0] && this.lowestDelayTimes <= 0 && this.delay >= this.highestDelay) {
      // 收到停止指令 且 最高速跑完指定圈数 且 已经减速完毕
      this.isMoving = false
      if (typeof this.stoppedCallback === 'function') this.stoppedCallback() // 触发stopped事件
      return
    }

    if (this.lowestDelayTimes > 0) this.delay -= 10 // 最高速转动达到指定圈数后才减速，否则一直加速
    else this.delay += 10

    if (this.delay <= this.lowestDelay) this.lowestDelayTimes--

    // 修正水果机的速度在区间内
    if (this.delay < this.lowestDelay) this.delay = this.lowestDelay
    if (this.delay >= this.highestDelay) this.delay = this.highestDelay

    this.timeoutId = setTimeout(() => this.move(false), this.delay)
  }

  reRender() { // 更新DOM的样式
    this.items.forEach((item, index) => {
      if (index === this.queue[0]) {
        item.classList.add(this.itemActiveClass)
      } else {
        item.classList.remove(this.itemActiveClass)
      }
    })
  }
}
