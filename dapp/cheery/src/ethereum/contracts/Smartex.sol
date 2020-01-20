pragma solidity ^0.4.23;

contract Smartex {
  // 版本号
  string public version = "1.0.0";

  // 合约创建者
  address public creator;
  // 用户编号
  uint public currentUserID;

  // 定义等级与以太币的对应值
  mapping (uint => uint) public levelPrice;
  // 存储用户列表
  mapping (address => User) public users;
  // 存储用户编号与用户地址映射
  mapping (uint => address) public userAddresses;


  // 定义最大等级
  uint MAX_LEVEL = 6;
  // 定义最大下线
  uint REFERRALS_LIMIT = 2;
  // 定义等级有效期
  uint LEVEL_DURATION = 36 days;
  // uint LEVEL_DURATION = 30 minutes;

  struct User {
    // 用户编号
    uint id;
    // 上线编号
    uint referrerID;
    // 对应的下线地址数组，即被推荐人或自动分配人地址数组
    address[] referrals;
    // 等级有效期
    mapping (uint => uint) levelExpiresAt;

  }

  event RegisterUserEvent(address indexed user, address indexed referrer, uint time);
  event BuyLevelEvent(address indexed user, uint indexed level, uint time);
  event GetLevelProfitEvent(address indexed user, address indexed referral, uint indexed level, uint time);
  event LostLevelProfitEvent(address indexed user, address indexed referral, uint indexed level, uint time);

  // 判断该地址是否已存在在用户列表；即是否已经注册。
  modifier userNotRegistered() {
    require(users[msg.sender].id == 0, 'User is already registered');
    _;
  }

  // 判断用户是否已注册
  modifier userRegistered() {
    require(users[msg.sender].id != 0, 'User does not exist');
    _;
  }

  // 判断上线ID(_referrerID)，必须大于 0 且小于当前 currentUserID的值
  modifier validReferrerID(uint _referrerID) {
    require(_referrerID > 0 && _referrerID <= currentUserID, 'Invalid referrer ID');
    _;
  }

  // 判断等级是否在当前范围内
  modifier validLevel(uint _level) {
    require(_level > 0 && _level <= MAX_LEVEL, 'Invalid level');
    _;
  }

  // 传入的以太币值必须是等级一对应的数量
  modifier validLevelAmount(uint _level) {
    require(msg.value == levelPrice[_level], 'Invalid level amount');
    _;
  }

  constructor() public {
    // 初始化购买等级所需的以太币
    levelPrice[1] = 0.5 ether;
    levelPrice[2] = 1 ether;
    levelPrice[3] = 2 ether;
    levelPrice[4] = 4 ether;
    levelPrice[5] = 8 ether;
    levelPrice[6] = 16 ether;

    currentUserID++;

    creator = msg.sender;

    // 初始化时，添加合约创建者至 users列表中，注：createNewUser 参数为 上线ID
    users[creator] = createNewUser(0);
    // 对应绑定所有的用户地址与用户ID
    userAddresses[currentUserID] = creator;

    // levelExpiresAt 等级有效期：定义为 等级购买日期加上 有效期天数字段 LEVEL_DURATION
    for (uint i = 1; i <= MAX_LEVEL; i++) {
      users[creator].levelExpiresAt[i] = 1 << 37;  // 合约创建者，等级 1-6 levelExpiresAt 都是 137438953472
    }
  }

  // 找不到匹配函数，调用回调函数
  function () external payable {
    uint level;

    // 传入以太币与等级匹配，获取等级
    for (uint i = 1; i <= MAX_LEVEL; i++) {
      if (msg.value == levelPrice[i]) {
        level = i;
        break;
      }
    }

    // 判断：等级小于等于 0，即抛出错误
    require(level > 0, 'Invalid amount has sent');

    // 若其在用户列表中存在，即调用购买等级方法 buyLevel
    if (users[msg.sender].id != 0) {
      buyLevel(level);
      return;
    }

    // 若用户列表中不存在 且 等级不等于 1，则抛出注册时只需 0.5以太币
    if (level != 1) {
      revert('Buy first level for 0.5 ETH');
    }

    // 通过完整的 calldata，获取上线地址
    address referrer = bytesToAddress(msg.data);
    registerUser(users[referrer].id);
  }

  // 用户注册
  // 其注册分为两种：1. 自动注册，即无推荐人分享链接，个人觉得这里的上线编号直接使用 0，然后在通过 findReferrer去寻找数量不足 REFERRALS_LIMIT的作为其上线
  //               2. 手动注册，即拥有上线编号。
  function registerUser(uint _referrerID) public payable userNotRegistered() validReferrerID(_referrerID) validLevelAmount(1) {
    // 判断下线是否在范围内，此合约 REFERRALS_LIMIT 为 2
    if (users[userAddresses[_referrerID]].referrals.length >= REFERRALS_LIMIT) {
      // 若不在范围内，则使用 findReferrer：首先进行判断是否小于 下线限制值，是返回地址，否 则是通过循环遍历找出下线还未达到限制值的地址
      _referrerID = users[findReferrer(userAddresses[_referrerID])].id;
    }

    currentUserID++;

    // 添加值用户列表
    users[msg.sender] = createNewUser(_referrerID);
    // 添加至用户编号 与 用户地址映射
    userAddresses[currentUserID] = msg.sender;
    // 设置等级一的期限：当前日期加上当前 LEVEL_DURATION值 36 days
    users[msg.sender].levelExpiresAt[1] = now + LEVEL_DURATION;

    // 将当前用户添加至其上线用户中
    users[userAddresses[_referrerID]].referrals.push(msg.sender);

    // 调用 transferLevelPayment方法，level参数为 1，所以注册时是向上线进行转账操作
    transferLevelPayment(1, msg.sender);
    // 监听事件，可用监听事件获取信息
    emit RegisterUserEvent(msg.sender, userAddresses[_referrerID], now);
  }

  // 购买等级
  function buyLevel(uint _level) public payable userRegistered() validLevel(_level) validLevelAmount(_level) {
    // 判断用户拥有的前几个等级是否在有效期内
    for (uint l = _level - 1; l > 0; l--) {
      require(getUserLevelExpiresAt(msg.sender, l) >= now, 'Buy the previous level');
      // 增加：购买、续费等级前，把之前所有等级修改为 当前日期加上 LEVEL_DURATION
      users[msg.sender].levelExpiresAt[_level] = now + LEVEL_DURATION * (_level);
    }

    for (uint i = 0; i < _level; i++) {
      // 增加：购买、续费等级前，把之前所有等级修改为 当前日期加上 LEVEL_DURATION
      users[msg.sender].levelExpiresAt[i+1] = now + LEVEL_DURATION * (_level - i);
    }
    // // 判断用户的该等级是否存在
    // if (getUserLevelExpiresAt(msg.sender, _level) == 0) {
    //   // 不存在即购买等级
    //   users[msg.sender].levelExpiresAt[_level] = now + LEVEL_DURATION;
    // } else {
    // // 存在即续费等级
    //   users[msg.sender].levelExpiresAt[_level] += LEVEL_DURATION;
    // }

    transferLevelPayment(_level, msg.sender);
    emit BuyLevelEvent(msg.sender, _level, now);
  }

  function findReferrer(address _user) public view returns (address) {
    // 在下线限制范围之内，返回对应地址
    if (users[_user].referrals.length < REFERRALS_LIMIT) {
      return _user;
    }

    // 不在下线限制范围内，通过 1-1024 进行依次查找是否存在下线没有限制的项
    address[1024] memory referrals;
    referrals[0] = users[_user].referrals[0];
    referrals[1] = users[_user].referrals[1];

    address referrer;

    for (uint i = 0; i < 1024; i++) {
      if (users[referrals[i]].referrals.length < REFERRALS_LIMIT) {
        referrer = referrals[i];
        break;
      }

      if (i >= 512) {
        continue;
      }

      referrals[(i+1)*2] = users[referrals[i]].referrals[0];
      referrals[(i+1)*2+1] = users[referrals[i]].referrals[1];
    }

    require(referrer != address(0), 'Referrer was not found');

    return referrer;
  }

  //查找指定节点id的下线总人数，内部调用递归函数
  function conutReferralsNum( uint uid ) public returns(uint) {
      uint   count=0;    //
      count = recursive( uid, count );
      return count;
  }

  //递归查找节点
  function recursive( uint uid,   uint   count ) public returns(uint) {
    address uaddr = userAddresses[uid];
    User memory user = users[uaddr];


    //递归结束。直接返回上级节点
    if ( user.referrals.length<=0) {
      return count;
    }

    for (uint i = 0; i < user.referrals.length; i++) {

      count++;

      address  sonaddr = user.referrals[i];
      uint  sonid =  users[sonaddr].id;
      count = recursive( sonid, count );
    }
    return count;

  }

  // 向对应上级转账，等级 1、4：向上级转账；2、5：向上级的上级转账；3、6：向上级的上级的上级转账；
  function transferLevelPayment(uint _level, address _user) internal {
    uint height = _level > 3 ? _level - 3 : _level;
    address referrer = getUserUpline(_user, height);

    if (referrer == address(0)) {
      referrer = creator;
    }

    if (getUserLevelExpiresAt(referrer, _level) < now) {
      emit LostLevelProfitEvent(msg.sender, referrer, _level, now);
      transferLevelPayment(_level, referrer);
      return;
    }

    if (addressToPayable(referrer).send(msg.value)) {
      emit GetLevelProfitEvent(msg.sender, referrer, _level, now);
    }
  }

  // 根据 height获取对应上线
  function getUserUpline(address _user, uint height) public view returns (address) {
    if (height <= 0 || _user == address(0)) {
      return _user;
    }

    return this.getUserUpline(userAddresses[users[_user].referrerID], height - 1);
  }

  // 获取指定地址的下线
  function getUserReferrals(address _user) public view returns (address[] memory) {
    return users[_user].referrals;
  }

  // 获取指定地址，指定等级的【有效期
  function getUserLevelExpiresAt(address _user, uint _level) public view returns (uint) {
    return users[_user].levelExpiresAt[_level];
  }

  // 创建用户
  function createNewUser(uint _referrerID) private view returns (User memory) {
    return User({ id: currentUserID, referrerID: _referrerID, referrals: new address[](0) });
  }

  // 转地址
  function bytesToAddress(bytes memory _addr) private pure returns (address addr) {
    assembly {
      // 内联汇编：mload 获取前 32字节
      addr := mload(add(_addr, 20))
    }
  }

  function addressToPayable(address _addr) private pure returns (address payableAddr) {
    return address(uint160(_addr));
  }
}
