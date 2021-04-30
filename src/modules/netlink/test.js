const { netlink } = stealify.library('./netlink.so', 'netlink')

stealify.print(netlink.calculate(1))
