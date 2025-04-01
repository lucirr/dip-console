import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop" />
          <AvatarFallback>SD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Sarah Davis</p>
          <p className="text-sm text-muted-foreground">sarah.davis@email.com</p>
        </div>
        <div className="ml-auto font-medium">+$1,999.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop" />
          <AvatarFallback>JM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">James Miller</p>
          <p className="text-sm text-muted-foreground">james.miller@email.com</p>
        </div>
        <div className="ml-auto font-medium">+$1,499.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop" />
          <AvatarFallback>RW</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Robert Wilson</p>
          <p className="text-sm text-muted-foreground">robert.wilson@email.com</p>
        </div>
        <div className="ml-auto font-medium">+$2,499.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop" />
          <AvatarFallback>EL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Emily Lee</p>
          <p className="text-sm text-muted-foreground">emily.lee@email.com</p>
        </div>
        <div className="ml-auto font-medium">+$899.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop" />
          <AvatarFallback>MB</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Michael Brown</p>
          <p className="text-sm text-muted-foreground">michael.brown@email.com</p>
        </div>
        <div className="ml-auto font-medium">+$3,499.00</div>
      </div>
    </div>
  );
}