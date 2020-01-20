pragma solidity ^0.4.20;

//智能水果合约
contract SmartFruit {   
  
  address    creator;      // 合约创建者 

  uint16     currentUserID;// 用户编号  
  address[]  effectUsers;  // 存储有效用户列表 
  address[]  usersArray;   // 存储用户列表 
  mapping (address => User)  users;     // 存储用户列表  
  mapping (uint => address)  userAddresses;  // 存储用户编号与用户地址映射
  
  mapping (address => Account) accounts;     // 存储用户账本列表  

  //---------- 参数定义 ------------------------------------------------------
  //开发者账户
  address constant DEVELOPER_ADDRESS = 0x89fF5E45d84bA94CDB6ec7313202D936c59932bc;
  
  // 定义用户管理的最大层级
  uint  constant MAX_LEVEL = 12;
  // 定义最大下线数
  uint  constant REFERRALS_LIMIT = 12;
  // 定义未激活状态的有效期，默认1小时
  uint  constant LEVEL_DURATION = 1 hours;
  
  // 定义开奖周期，默认24小时。
//  uint public constant LOTTERY_CYCLE = 24 hours;
	uint public constant LOTTERY_CYCLE = 30 minutes;
	
  //每笔推广收入锁定时间
//   uint FREEZING_DURATION = 1 hours;
  uint  constant FREEZING_DURATION = 5 minutes;
  
  //会员收入上限  用户等级1限额1.5/ 用户等级2限额3
  uint STATE_MULTIPLY_1 = 15;
  uint STATE_MULTIPLY_3 = 30;
  
  //水果数量限制
  uint8 public constant FRUIT_LEVEL1 = 10;
  uint8 public constant FRUIT_LEVEL2 = 50;
  
  //水果价格  1个水果=0.1ETH
  uint public constant FRUIT_PRICE = 0.1 ether;
  
  //---------------数据结构 -----------------------
  //用户的账本结构
  struct Account{
    uint member;         //会员收入   --手动提取转入可用金 
    uint promotion;      //推广收入   --自动解锁后转入可用金  
    uint lottery;        //奖池收入   --自动转入可用金    
    uint cash;   //可用金
    
    uint  currentID_members;               //会员收入记录编号 
    mapping (uint => Income) members;      //会员收入记录，key=编号    
    uint  currentID_promotions;            //推广收入记录编号 
    mapping (uint => Income) promotions;   //推广收入记录，key=编号 
    uint  currentID_lotterys;              //奖池收入记录编号 
    mapping (uint => Income) lotterys;     //奖池收入记录，key=编号 
    uint  currentID_expends;               //购买水果记录编号 
    mapping (uint => Expend) expends;      //购买水果记录，key=编号
  }
  
  //交易记录
  //支出： 就是用户购买水果的花费，发送到了合约账户中，由合约进行分配。
  struct Expend {
    address from;      //用户地址
    uint value;        //金额
    uint8 count;       //水果数量
    uint expiretime;   //时间戳
  }

  //收入交易，这是内部交易记录
  struct Income {
    uint8   kind;          // 收入类型（1会员收入、2推广收入、3奖池收入）1字节 
    uint8   freezeStatus;  // 冻结状态 1冻结,0解冻 1字节 
    uint32  fromid;        // 发起方id            4字节 
    uint64  freezeTime;    // 冻结到期时间，      8字节 
    uint128  value;        // 金额,单位wei，      16字节   
 	uint16  bak;           // 备用, 2字节   
  }
  
  //----------- 用户数据结构 ---------------------------
  // 用户状态说明
  // 0=无效，账号已经过期，无法再登录使用。
  // 1=有效，购买水果不足10个，对应刚刚加入的用户
  // 2=激活，购买水果满10个，获得推荐权，推荐下线不足12人。
  // 3=高级，推荐下线达到12人以上，可以购买最多50个水果
  // 4=冻结，提取了会员收入自动切换成冻结状态，有效期是1小时。
  //         此期间内无法获得任何收入，保留组织结构。过期后转为无效状态。
  //         重新购买水果后转为有效/激活/高级状态。
/*  
  状态    进入条件           购买水果最大数量    收入
  0 无效  过期                              
  1=有效  购买最少1个水果    <=10            会员收入封顶1.5倍水果+ 奖池收入
  2=激活  买10个水果         <=10            会员收入封顶1.5倍水果+ 奖池收入 + 推广收入
  3=高级  推荐12人以上       <=50            会员收入封顶3倍水果+ 奖池收入 + 推广收入
  4=冻结  提取会员收入       <=50            无
*/  
  struct User {    
    uint16  id;            // 用户编号   
    uint8 state;         // 用户状态
    uint  expirationDate;//未激活状态有效期
    uint8 fruit;         // 持有的水果数量 
    uint16  referrerID;    // 上线编号    
    address[] referrals; // 对应的直接下线地址数组
  }
  
  //---------------------账户相关函数 -----------------------------------------
  //新建账户 
  function createNewAccount() private pure returns(Account memory){
      Account memory account = Account({ member:0,
                                      promotion:0,
                                      lottery:0,
                                      cash:0, 
                                      currentID_members:0,
                                      currentID_promotions:0,
                                      currentID_lotterys:0,
                                      currentID_expends:0
                                });
      return account;
  }
  //新建一条推广收入记录
  function  addAccountPromotions(address fromAddr, address addr, uint128 value) private{
        Account storage ac = accounts[addr];
        User storage u = users[fromAddr];
        Income memory newincome = Income({
            kind   : 2,        // 收入类型（1会员收入、2推广收入、3奖池收入）
            freezeStatus:1,    //1冻结,0解冻
        	fromid   : u.id,    //发起方地址
        	freezeTime:uint64(now+FREEZING_DURATION),  //冻结到期时间 
        	value  : value,     // 金额
        	bak:0
        });
        ac.promotions[ac.currentID_promotions]= newincome; 
        ac.currentID_promotions++;
  }
  
  //新建一条奖池收入记录
  function  addAccountLotterys(address addr, uint128 value) private{
        Account storage ac = accounts[addr];
        Income memory newincome = Income({
            kind   : 3,        // 收入类型（1会员收入、2推广收入、3奖池收入）
            freezeStatus:0,    //1冻结,0解冻
        	fromid   : 0,    //发起方地址
        	freezeTime:uint64(now),  //冻结到期时间 
        	value  : value,     // 金额
        	bak:0
        });
        ac.lotterys[ac.currentID_lotterys]= newincome; 
        ac.currentID_lotterys++;
  }
  
  //--------------------------------------------------------------
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

  //--------合约构造函数，完成初始化----------------------------------------------------
  constructor() public {
    creator   = msg.sender;
    currentUserID++;
	lotteryTime = now;
    
    initLevelPercent(); 


    //自动建立合约创建者用户
    User memory u = createNewUser(0);     
    users[creator] = u;    
    userAddresses[currentUserID] = creator; // 对应绑定所有的用户地址与用户ID
    
    effectUsers = new address[](0);
    usersArray = new address[](0);
    usersArray.push(creator);
    
    accounts[creator] = createNewAccount(); //创建账本 

  }
  
  // 找不到匹配函数，调用回调函数
  function () external payable {
    uint level;
    require(level > 0, 'Invalid amount has sent');
  }
  
  //--------------------------------------------------------------
  // 定义层级与会员收入的对应值，12层，每层获取的会员收入比例, 合计40%。
  mapping (uint8 => uint) public levelPercent; 
  
  function initLevelPercent() private {
  	levelPercent[0]  = 0;   //这级未使用
  	levelPercent[1]  = 10;
  	levelPercent[2]  = 8;
  	levelPercent[3]  = 6;
  	levelPercent[4]  = 5;
  	levelPercent[5]  = 3;
  	levelPercent[6]  = 2;
  	levelPercent[7]  = 1;
  	levelPercent[8]  = 1;
  	levelPercent[9]  = 1;
  	levelPercent[10] = 1;
  	levelPercent[11] = 1;
  	levelPercent[12] = 1;  
  } 
  
  //---------------- 用户操作方法 ----------------------------------------------
  //重新计算有效用户
  function  updateValidUsers() private {
    effectUsers = new address[](0);
    for(uint i=0;i<usersArray.length;i++)
    {
    	User storage u = users[usersArray[i]];
     	if(isValid(u))
     	{  //有效
     	   effectUsers.push(usersArray[i]);
     	}
    }
  }
  //判断用户是否有效：false=无效，true=有效
  function isValid(User storage u) private view returns(bool){
      if(u.state==0 || u.state==4){
          return false;
      }
      return true;
  }
  
  //判断用户是否冻结：false=未冻结，true=冻结
  function isFreezing(User storage u) private view returns(bool){
      if(u.state==4){
          return true;
      }
      return false;
  }
  
  //判断用户是否会员收入封顶：false=未封顶，true=封顶
  function isFull(User storage  u) private view returns(bool){
      Account storage ac = accounts[ userAddresses[u.id] ];
      if(u.state==1 || u.state==2){          
          if( (STATE_MULTIPLY_1*u.fruit*FRUIT_PRICE/10) <= ac.member){
              return true;
          }          
      }else if(u.state==3){
          if( (STATE_MULTIPLY_3*u.fruit*FRUIT_PRICE/10) <= ac.member){
              return true;
          } 
      }
      return false;
  }
  
  //判断用户是否具备推荐权，依据状态=2/3才有推荐权
  function isReferrer(User storage u) private view returns(bool){
      if(u.state==2 || u.state==3){
          return true;
      }
      return false;
  }
  
  //创建新用户,默认是购买了一个水果，状态为1=有效
  function createNewUser(uint16  _referrerID) private view returns(User memory){
      return User({ id: currentUserID, 
    			  state:1,
    			  expirationDate:0,
    			  fruit:1,
                  referrerID: _referrerID, 
                  referrals: new address[](0)
                });
  }
  
  //--------------------------UI接口 -------------------------------
  //根据用户id读取用户地址， id必须有效。
  function getUserAddresses_UI(uint id) public view returns(address){
      return userAddresses[id];
  }
  
  //是否允许登录,返回0=允许登录，1=无效。 UI调用接口
  //每次用户登录时要检查是否过期，过期了就更改状态。
  function login_UI(address addr) public returns(uint ret){
  	  User storage u = users[addr];  		 
      if(u.state==4){
          if( u.expirationDate < now ){
              u.state=0;
          }  
      }	
      
      if(u.state==0){
          return 1; 
      }
      else{
          return 0;  
      } 
  }
  
  // 用户注册，UI调用接口
  // 1. 自动注册，上线编号默认为1，
  // 2. 手动注册，即输入上线编号。
  function registerUser_UI(uint16 _referrerID) public payable userNotRegistered() validReferrerID(_referrerID)  {
    // 判断下线是否在范围内，此合约 REFERRALS_LIMIT 为 12
    uint16 newRefID = _referrerID; 
    // 若不在范围内，则使用 findReferrer：首先进行判断是否小于下线限制值，
    // 是-返回地址，否则-通过循环遍历找出下线还未达到限制值的地址
    if (users[userAddresses[_referrerID]].referrals.length >= REFERRALS_LIMIT) {
        newRefID = users[findReferrer(userAddresses[_referrerID])].id;
    }

    currentUserID++;

    // 添加新用户
    User memory u = createNewUser(newRefID); 
    users[msg.sender] = u;
    userAddresses[currentUserID] = msg.sender;     
    usersArray.push(msg.sender);
    accounts[msg.sender] = createNewAccount(); //创建账本 

    // 将新用户地址添加至其上线用户中,同时检查上线是否满足12个下线；如果满足就升级状态
    User storage refer = users[userAddresses[newRefID]];
    refer.referrals.push(msg.sender);
    if(refer.referrals.length >= REFERRALS_LIMIT){
        if(refer.state == 2) { // 任意状态下都可以能被动添加子节点
          refer.state = 3;
        }
    }
    
    pushFruitUser(msg.sender,1);  //注册就是购买1个水果,存入最新水果买家列表  
    buyFruitPayment(msg.sender,msg.value); //按照规定方案分配注册费用
    
  }
  
  //返回用户信息，UI调用接口
  function getUserInfo_UI(address addr) public view returns(uint16, uint8, uint, uint8, uint16){
      User storage u = users[addr];
      return (u.id,
              u.state,
              u.expirationDate,
              u.fruit,
              u.referrerID);
  }
  
  //返回用户下线信息(编号2/状态1/地址20字节)，UI调用接口
  function getUserReferrals_UI(address addr) public view returns(bytes32[]){
      User storage u = users[addr];
      u.referrals;
      bytes32[] memory data = new bytes32[](u.referrals.length);
      for(uint i=0; i<u.referrals.length;i++ ){
          address  r = u.referrals[i];
          User storage ur = users[r];
          uint ret =0;
          ret =   uint(ur.id)<<240 
                | uint(ur.state)<<232 
                | uint(r)<<72;
         data[i] = bytes32( ret); 
      }
      return data;
  }
  
  //返回用户账户信息(会员收入/推广收入/奖池收入/可用金额 )，UI调用接口
  function getUserAccount_UI(address addr) public view returns(uint, uint, uint, uint){
      Account storage ac = accounts[addr];
      return (ac.member,
              ac.promotion,
              ac.lottery,
              ac.cash);
  }
  
  //用户购买水果，改变状态，填写购买记录，UI调用接口
  function buyFruit_UI(address addr, uint8 count) public payable {
      User storage u = users[addr];
      u.fruit += count;
    //   if(isFreezing(u)){      
        if(u.referrals.length<REFERRALS_LIMIT){
            if(u.fruit>FRUIT_LEVEL1){
	              u.state = 2;
	              u.fruit = FRUIT_LEVEL1;
	          }else{
	              u.state = 1;
	          }
        }else{  //有12个下线，购买水果数量<10状态为1有效，>=10状态为3高级            
            if(u.fruit>=FRUIT_LEVEL1){
                u.state = 3;
                if(u.fruit>FRUIT_LEVEL2)
	                u.fruit = FRUIT_LEVEL2;
	          }else{
	              u.state = 1;
	          }
        }
        
    //   }else{
	   //   if(u.fruit>=FRUIT_LEVEL2){
    //           u.state = 3;
	   //       u.fruit = FRUIT_LEVEL2;
	   //   }else if(u.fruit>=FRUIT_LEVEL1){
	   //       u.state = 2;
	   //       u.fruit = FRUIT_LEVEL1;
	   //   }
    //   }
      pushFruitUser(addr,count);  //存入最新水果买家列表 
      
      buyFruitPayment(msg.sender,msg.value); //按照规定方案分配费用
     
  }
  
  //提取现金，把可用现金转到用户账户   
  function withdrawcCash_UI(address addr) public returns(bool) {
    //User storage u = users[addr];
    Account storage ac = accounts[addr];
    if(ac.cash==0){
      //用户无效/可用现金为0， 提取失败
      return false;
    }
    
    if (addressToPayable(addr).send(ac.cash)) {
        ac.cash=0;
      //emit GetDeveloperEvent(addr, developer, ac.cash, now);
    }
       
  }
  
  //提取收入，把各种收入全部转到可用现金。奖池收入直接归入可用现金，不用提取     
  function withdrawIncome_UI(address addr) public returns(bool) {
    
    //提取推广收入，转入到可用金额中，状态不变。
    withdrawPromotions_UI(addr);
    
    withdrawMember_UI(addr);
   
  }
  
  //提取会员收入，转入到可用金额中，状态切换到未激活。UI调用接口
  //addr: 用户账户地址，返回提取成功失败true/false 
  function withdrawMember_UI(address addr) private returns(bool) {
      User storage u = users[addr];
      Account storage ac = accounts[addr];
      if( !isValid(u) || ac.member==0){
          //用户无效/会员收入为0， 提取失败
          return false;
      }
      ac.cash+=ac.member;  //可用现金增加
      ac.member=0;         //会员收入清零
      u.state = 4;         //状态未激活  
      u.expirationDate = now + LEVEL_DURATION;  //设置到期时间
      u.fruit=0;           //清除水果数
      return true;
  }
  
  //提取推广收入，转入到可用金额中，状态不变。每次登录时自动调用一次。  UI调用接口
  //addr: 用户账户地址，返回提取成功失败true/false 
  function withdrawPromotions_UI(address addr) public returns(bool) {
      User storage u = users[addr];
      Account storage ac = accounts[addr];
      if( !isValid(u) || ac.promotion==0){
          //用户无效/推广收入为0， 提取失败
          return false;
      }
      
      uint count = ac.currentID_promotions;
      //解冻 
      for(uint i=0;i<count; i++){
          if(ac.promotions[i].freezeStatus==1){
              if(ac.promotions[i].freezeTime < now){  //过期解冻 
                  ac.promotions[i].freezeStatus=0;
              }
          }
          if(ac.promotions[i].freezeStatus==0){
              ac.cash+=ac.promotions[i].value;  //提取解冻收入, 可用现金增加
              delete ac.promotions[i];          //提取后删除记录  
          }
      }
      
      //重新计算冻结部分的金额   
      ac.promotion=0;
      for(uint k=0;k<count; k++){
          if(ac.promotions[k].freezeStatus==1){
              ac.promotion += ac.promotions[k].value;
          }
      }
      return true;
  }
  
  //无需调用。奖池收入自动转入到可用金额中，状态不变。UI调用接口
  //addr: 用户账户地址，返回提取成功失败true/false 
  function withdrawLotterys_UI(address addr) private returns(bool) {
      User storage u = users[addr];
      Account storage ac = accounts[addr];
      if( !isValid(u) || ac.lottery==0){
          //用户无效/奖池收入为0， 提取失败
          return false;
      }
      
      ac.cash+=ac.lottery;  //提取解冻收入, 可用现金增加
      ac.lottery=0;
      return true;
  }
 
  
  //查找指定节点id的下线总人数，内部调用递归函数, UI 调用接口 
  function conutReferralsNum_UI( uint uid ) public view returns(uint) {
      uint   count=0;    //
      count = recursive( uid, count );
      return count;
  }
  
  //返回推广收入记录，UI调用接口 
  function  getAccountPromotions_UI(address addr) public view returns(bytes32[] ){
      Account storage ac = accounts[addr];
      
      uint len=0;
      for(uint j=0; j<ac.currentID_promotions;j++ ){
          if(ac.promotions[j].freezeStatus==1){
              len++;
          }
      }
      bytes32[] memory data = new bytes32[](len);
      
      uint x = 0;
      for(uint i=0; i<ac.currentID_promotions;i++ ){
          if(ac.promotions[i].freezeStatus==1){
              Income storage income = ac.promotions[i];
              uint ret =0;
              ret =   uint(income.kind)<<248 
                    | uint(income.freezeStatus)<<240 
                    | uint(income.fromid)<<208
                    | uint(income.freezeTime)<<144
                    | uint(income.value)<<16;
              data[x] = bytes32( ret); 
              x++;
          }
      }
      return data;
  }
  
  //返回奖池收入记录，UI调用接口 
  function  getAccountLotterys_UI(address addr) public view returns(bytes32[] ){
      Account storage ac = accounts[addr];
      bytes32[] memory data = new bytes32[](ac.currentID_lotterys);
      
      for(uint i=0; i<ac.currentID_lotterys;i++ ){
          Income storage income = ac.lotterys[i];
          uint ret =0;
          ret =   uint(income.kind)<<248 
                | uint(income.freezeStatus)<<240 
                | uint(income.fromid)<<208
                | uint(income.freezeTime)<<144
                | uint(income.value)<<16;
         data[i] = bytes32( ret);           
      }
      return data;
  }
  
  //-------------- 算法 ----------------------------
 
  //查找合适的上线，
  function findReferrer(address _user) private view returns (address) {
    //下线未满，返回对应地址
    if (users[_user].referrals.length < REFERRALS_LIMIT) {
      return _user;
    }

    //下线已满， 继续查找下一级下线节点，检查是否存在下线未满的节点。
    //限制查找最多1884个节点，这是3层全满的节点总数。如果还没找到就返回查找失败。
    address[1024] memory referrals;
    referrals[0] = users[_user].referrals[0];
    referrals[1] = users[_user].referrals[1];

    address referrer;

    for (uint i = 0; i < 1884; i++) {
      if (users[referrals[i]].referrals.length < REFERRALS_LIMIT) {
        referrer = referrals[i];
        break;
      }

      if (i >= 156) {
        continue;
      }

      referrals[(i+1)*2] = users[referrals[i]].referrals[0];
      referrals[(i+1)*2+1] = users[referrals[i]].referrals[1];
    }

    require(referrer != address(0), 'Referrer was not found');
    return referrer;
  }
  
  
  //用户购买水果后，按照规定方案分配
  function buyFruitPayment(address addr, uint value) private {  	  	
  	  	
  	// 5% 开发者账户
  	if (addressToPayable(DEVELOPER_ADDRESS).send(value*5/100)) {
      //emit GetDeveloperEvent(addr, developer, value*5/100, now);
    }
    
    // 5% 奖池
    lotteryMoney += (value*5/100);
    
    
    // 50% 平均分配，所有有效会员按人数平分，计入账本
    shareIncome(addr, value*50/100);
     
    
    // 40% 推广费用
    for(uint8 j=1; j<=12;j++){
      toHigherPayment(j,addr, value*levelPercent[j]/100);
    }
    
  }
  
  // 50% 平均分配，重新计算所有有效会员，按人数平分，计入账本
  function shareIncome(address addr, uint value) private {
    effectUsers = new address[](0);
    for(uint i=0;i<usersArray.length;i++)
    {
    	User storage u = users[usersArray[i]];
     	if(isValid(u) && !isFull(u))
     	{  //有效+未封顶
     	   effectUsers.push(usersArray[i]);
     	}
    }
    
    // //计算出每个账户分配的份额
    uint quotient = value/effectUsers.length;
    for(uint k=0;k<effectUsers.length;k++)
    {  
    	Account storage ac = accounts[effectUsers[k]];
    	ac.member += quotient;
    	
    // 	//新建一条会员收入记录
    //     Income memory newincome = Income({
    //   	    kind   : 1,           // 收入类型（1会员收入、2推广收入、3奖池收入）
    // 		value  : quotient,    // 金额
    // 		from   : addr,        //发起方地址
    // 		to     : effectUsers[k], //接收方
    // 		freezeStatus:0,       //1冻结,0解冻
    // 		freezeTime: 0        //冻结到期时间 
    //     });
    //     ac.currentID_members++;
    //     ac.members[ac.currentID_members]= newincome; 
    }
  }
  
  
  // 向对应上级转账，共12级；如果上级无效或冻结，就跳过继续向上一级。
  function toHigherPayment(uint _level, address _user, uint value) private {
    uint height = _level;
    address referrer = getUserUpline(_user, height);
    if (referrer == address(0)) {
      referrer = creator;
    }

    //具备推广权的用户才能拿到推广收入,
    //如果上一级没有推荐权，就递归向上一级。
    //如果遇到根节点就停止递归。
    //如果根节点没有推荐权也获得收入。
    User storage u = users[referrer];    
    if ( referrer != creator && !isReferrer(u) ){
      toHigherPayment(_level, referrer, value);
      return;
    }
    
    //总算找到一个有效上级，计入账本  
    Account storage ac = accounts[referrer];
    ac.promotion += value; 
    //ac.cash += value;  //可用现金增加 
    
    //新建一条推广收入记录
    addAccountPromotions(_user, referrer, uint128(value));
  }
  
  
  // 根据 上线高度 获取对应的上线
  function getUserUpline(address _user, uint height) private view returns (address) {
    //向上查到了根节点
    if (height <= 0 || _user == address(0) || _user==creator) {
      return _user;
    }
 
    return getUserUpline(userAddresses[users[_user].referrerID], height-1);
  }

  //递归查找节点
  function recursive( uint uid,   uint   count ) private view returns(uint) {
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
 
  // 转地址
  function bytesToAddress(bytes memory _addr) private pure returns (address addr) {
    assembly {
      // 内联汇编：mload 获取前 32字节
      addr := mload(add(_addr, 20))
    }
  }

  function addressToPayable(address _addr) private pure returns (address Addr) {
    return address(uint160(_addr));
  }
  
  
  //----------- 奖池数据结构 ---------------------------
  uint public lotteryMoney;   //本期金额   
  //LotteryHistory[] public lotteryHistory;  //中奖记录 
  address[]  last1KFruitUser;  //最后的1000个水果买家地址数组,新买家顶替了旧买家
  address[]  effectFruitUser;  //有效的水果玩家 
  uint8[]   fruitCount;  //有效玩家水果数量统计  
  uint constant MAX_FRUIT=100; //最后的1000个水果
  uint public lotteryTime; //下次开奖时间
  
  //中奖记录
  struct LotteryHistory{
    uint lotteryTime;  //开奖时间
    address winner;    //中奖者
    uint sum;          //本期金额  
  }
  
  //汇总前1000个水果的有效买家购买的数量，方便记账
  function statisticsFruitUser() private {
    
    effectFruitUser = new address[](0);
    fruitCount      = new uint8[](0);

    for( uint i = 0; i<last1KFruitUser.length; i++){
        address addr = last1KFruitUser[i];
        User storage u = users[addr];
        if(!isValid(u))   //跳过无效用户
            continue;
        
        bool findaddr = false;  //在effectUser中查找到指定地址标记
        uint pos=0;  //在effectUser中查找到指定地址的位置序号
        for(uint k=0;k< effectFruitUser.length;k++){        
            if( effectFruitUser[k] == addr){   
                findaddr = true;
                pos = k;
                break;
            }
        }           
        
       if(findaddr==false){  //用户不存在，存入数组
            effectFruitUser.push(addr); 
            fruitCount.push(1);
        }else{     //用户存在，找出序号，累加数量       
            fruitCount[pos] = fruitCount[pos]+1;           
        }
    }
  }
  
  //开奖,本期奖金40%平均发放给前1000个水果用户，60%发给幸运用户，UI调用接口 
  function drawLottery_UI() public returns(address ){
    //未到开奖时间返回  
    if(lotteryTime > now)
        return address(0);
    //开奖时间已到，更新下次开奖时间  
    lotteryTime += LOTTERY_CYCLE;
    
    if(lotteryMoney==0) 
        return address(0);
    //统计买家购买的数量
    statisticsFruitUser();
    
    uint total =0;  //统计总共多少水果
    uint part1 = lotteryMoney*4/10;   
    uint part2 = lotteryMoney-part1;
    lotteryMoney=0;
    uint i=0;
    for(i=0;i<fruitCount.length;i++){
      total+=fruitCount[i];
    }  
    
    //平均分配40%奖金给这些用户，记在各个用户奖金收入账户上
    User storage u;
    Account storage ac;
    for(i=0; i<effectFruitUser.length; i++){
        u = users[effectFruitUser[i]];
        ac = accounts[effectFruitUser[i]];
        uint lottery = fruitCount[i]*part1/total; 
        ac.lottery += lottery;
        ac.cash += lottery;  //可用现金增加  
        //新建一条奖池收入记录
        addAccountLotterys(effectFruitUser[i],uint128(lottery));
    }
    
    //选出中奖用户,发放60%奖金在账户上
    updateValidUsers();
    
    uint code = random(effectUsers.length);
    address winner = effectUsers[code];
    u = users[winner];
    ac = accounts[winner];
    ac.lottery += part2;
    ac.cash += part2;  //可用现金增加  
    
    //新建一条奖池收入记录
    addAccountLotterys(winner,uint128(part2));
    return winner;
  }
  
  //生成随机数
  function random(uint nonce) private view returns (uint) {
      bytes memory param = abi.encodePacked(block.timestamp, block.difficulty);
  		return uint(keccak256(param))%nonce;
  }
  

  //说明：用户购买水果，保存最新的1000个水果买家地址
  //addr：用户地址，count：购买水果数量
  function pushFruitUser(address addr, uint8 count) private {
      
      //数组不足1000，足够存下count个水果，直接存入。
      uint t= last1KFruitUser.length + count;
      uint8 i=0;
      if(t<=MAX_FRUIT ){
        for( i=0; i<count;i++){
            last1KFruitUser.push(addr);
        }
        return;
      }
      
      if( last1KFruitUser.length<MAX_FRUIT && t>MAX_FRUIT ){
        //数组不足1000，不能存下count个水果，要删除掉一些。
        uint delnum= t - MAX_FRUIT;
        deleteFruitUser(delnum);
        for( i=0; i<count;i++){
            last1KFruitUser.push(addr);
        }
        return;        
      }
      //数组已经存满1000个，要先删除掉count再存入。
      if(last1KFruitUser.length==MAX_FRUIT){
        deleteFruitUser(count);
        for( i=0; i<count;i++){
            last1KFruitUser.push(addr);
        }
        return; 
      }      
  }
  //从数组头部删除num个数据，之后的数据向前移动。
  function deleteFruitUser(uint num) private {
      if (num >= last1KFruitUser.length){
          last1KFruitUser = new address[](0);
          return;
      } 
      for (uint i = num; i<last1KFruitUser.length; i++){
          last1KFruitUser[i-num] = last1KFruitUser[i];
      }
      last1KFruitUser.length-=num;  //删除掉末尾的num数据，数组变短。
  }

}
